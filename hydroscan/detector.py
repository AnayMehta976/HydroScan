"""
Computer-vision detection pipeline (v2).

grayscale -> ROI crop -> CLAHE illumination fix -> glare mask -> blur
          -> white top-hat + adaptive threshold -> watershed split
          -> per-particle plastic-vs-debris scoring -> features.

Improvements over v1:
  * CLAHE evens out the LED lighting so the threshold behaves the same in the
    middle and the corners of the chamber.
  * Specular glare (LED reflections) is detected and masked out instead of
    being counted as giant "particles".
  * A white top-hat transform isolates small bright specks from the slowly
    varying background — far more robust than adaptive threshold alone.
  * Touching particles are split with a distance-transform watershed, so two
    specks stuck together count as two, not one.
  * Each particle gets a "plastic score" from colour + shape (bright,
    low-saturation, compact = plastic-like; brown/green, ragged = organic),
    and debris is excluded from the contamination count.
  * Multi-frame aggregation averages features across ALL accepted frames and
    uses the median count (v1 used a single best frame).
"""

import logging

import cv2
import numpy as np

import config

log = logging.getLogger("hydroscan.detector")


# ---------------------------------------------------------------------------
# Basic helpers
# ---------------------------------------------------------------------------

def _to_gray(frame_rgb):
    return cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)


def _crop_roi(img):
    h, w = img.shape[:2]
    l, t, r, b = config.ROI
    x0, y0 = int(w * l), int(h * t)
    x1, y1 = int(w * r), int(h * b)
    return img[y0:y1, x0:x1], (x0, y0)


def assess_quality(frame_rgb):
    gray = _to_gray(frame_rgb)
    focus = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(gray.mean())
    ok = (
        focus >= config.QUALITY_MIN_FOCUS
        and config.QUALITY_MIN_BRIGHTNESS <= brightness <= config.QUALITY_MAX_BRIGHTNESS
    )
    metrics = {"focus": round(focus, 2), "brightness": round(brightness, 2)}
    if not ok:
        log.warning("Frame failed quality gate: %s", metrics)
    return ok, metrics


# ---------------------------------------------------------------------------
# Pipeline stages
# ---------------------------------------------------------------------------

def _illumination_fix(gray):
    """CLAHE: local contrast equalisation so uneven LED light doesn't skew
    the threshold across the frame."""
    if not getattr(config, "USE_CLAHE", False):
        return gray
    clahe = cv2.createCLAHE(
        clipLimit=config.CLAHE_CLIP_LIMIT,
        tileGridSize=tuple(config.CLAHE_TILE_GRID),
    )
    return clahe.apply(gray)


def _glare_mask(gray):
    """Return a mask (255 = usable) that blanks out large saturated blobs
    caused by LED reflections on the water surface or chamber walls."""
    _, bright = cv2.threshold(
        gray, getattr(config, "GLARE_BRIGHTNESS", 245), 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(bright, cv2.RETR_EXTERNAL,
                                   cv2.CHAIN_APPROX_SIMPLE)
    mask = np.full(gray.shape, 255, dtype=np.uint8)
    min_area = getattr(config, "GLARE_MIN_AREA", 60)
    hit = False
    for c in contours:
        if cv2.contourArea(c) >= min_area:
            cv2.drawContours(mask, [c], -1, 0, -1)
            hit = True
    if hit:
        k = getattr(config, "GLARE_DILATE", 5)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
        mask = cv2.erode(mask, kernel)  # grow the blocked-out region
    return mask


def _binarize(gray):
    """Combine white top-hat + adaptive threshold into one binary map."""
    blur = cv2.GaussianBlur(gray, tuple(config.GAUSSIAN_KERNEL), 0)

    maps = []
    if getattr(config, "USE_TOPHAT", False):
        ksize = getattr(config, "TOPHAT_KERNEL_SIZE", 15)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ksize, ksize))
        tophat = cv2.morphologyEx(blur, cv2.MORPH_TOPHAT, kernel)
        # Otsu on the top-hat response separates real specks from noise.
        _, th = cv2.threshold(tophat, 0, config.THRESHOLD_MAX,
                              cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        maps.append(th)

    if config.USE_ADAPTIVE_THRESHOLD:
        maps.append(cv2.adaptiveThreshold(
            blur, config.THRESHOLD_MAX, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, config.ADAPTIVE_BLOCK_SIZE, -config.ADAPTIVE_C))

    if not maps:
        _, th = cv2.threshold(blur, config.THRESHOLD_VALUE,
                              config.THRESHOLD_MAX, cv2.THRESH_BINARY)
        maps.append(th)

    if len(maps) == 1:
        binary = maps[0]
    else:
        # A pixel must fire in BOTH maps -> strong noise rejection.
        binary = cv2.bitwise_and(maps[0], maps[1])

    # Remove single-pixel salt noise.
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    return binary


def _split_touching(binary):
    """Distance-transform watershed: separate particles that touch."""
    if not getattr(config, "USE_WATERSHED", False):
        return binary

    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary)
    min_area = getattr(config, "WATERSHED_MIN_AREA", 30)
    big = np.zeros_like(binary)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            big[labels == i] = 255
    if not big.any():
        return binary

    small = cv2.subtract(binary, big)

    dist = cv2.distanceTransform(big, cv2.DIST_L2, 3)
    ratio = getattr(config, "WATERSHED_FG_RATIO", 0.45)
    _, sure_fg = cv2.threshold(dist, ratio * dist.max(), 255, 0)
    sure_fg = sure_fg.astype(np.uint8)

    _, markers = cv2.connectedComponents(sure_fg)
    markers = markers + 1
    unknown = cv2.subtract(big, sure_fg)
    markers[unknown == 255] = 0

    color = cv2.cvtColor(big, cv2.COLOR_GRAY2BGR)
    markers = cv2.watershed(color, markers)

    split = np.zeros_like(binary)
    split[markers > 1] = 255
    # Watershed ridge lines (-1) become the separation between particles.
    return cv2.bitwise_or(split, small)


def _plastic_score(patch_rgb, mask, circularity, solidity, elongation):
    """0..1 score of how plastic-like a particle looks.

    Plastic microfragments under white LED: bright, whitish (low HSV
    saturation), compact and fairly solid shapes.
    Organic/sediment: brownish or greenish (high saturation), darker,
    ragged outlines (low solidity), often elongated fibres of plant matter.
    """
    if mask.sum() == 0:
        return 0.0
    hsv = cv2.cvtColor(patch_rgb, cv2.COLOR_RGB2HSV)
    m = mask.astype(bool)
    sat = float(hsv[..., 1][m].mean())
    val = float(hsv[..., 2][m].mean())

    sat_limit = getattr(config, "DEBRIS_SATURATION", 90)
    s_score = float(np.clip(1.0 - sat / (sat_limit * 2.0), 0.0, 1.0))
    v_score = float(np.clip((val - 60) / 160.0, 0.0, 1.0))
    shape_score = float(np.clip(
        0.5 * solidity + 0.3 * circularity + 0.2 * (1.0 / max(elongation, 1.0)),
        0.0, 1.0))

    return round(0.40 * s_score + 0.30 * v_score + 0.30 * shape_score, 3)


def _extract_particles(binary, gray, rgb_roi):
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL,
                                   cv2.CHAIN_APPROX_SIMPLE)
    particles = []
    use_filter = getattr(config, "USE_PLASTIC_FILTER", False)
    for c in contours:
        area = cv2.contourArea(c)
        if area < config.MIN_PARTICLE_AREA or area > config.MAX_PARTICLE_AREA:
            continue
        perimeter = cv2.arcLength(c, True)
        circularity = (4 * np.pi * area / (perimeter * perimeter)) if perimeter > 0 else 0.0
        circularity = min(float(circularity), 1.0)
        x, y, w, h = cv2.boundingRect(c)
        elongation = (max(w, h) / min(w, h)) if min(w, h) > 0 else 1.0

        hull = cv2.convexHull(c)
        hull_area = cv2.contourArea(hull)
        solidity = float(area / hull_area) if hull_area > 0 else 1.0

        patch_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.drawContours(patch_mask, [c - [x, y]], -1, 255, -1)
        brightness = float(gray[y:y + h, x:x + w][patch_mask > 0].mean()) \
            if patch_mask.any() else 0.0

        if use_filter and rgb_roi is not None:
            score = _plastic_score(rgb_roi[y:y + h, x:x + w], patch_mask,
                                   circularity, solidity, elongation)
        else:
            score = 1.0

        particles.append({
            "area": float(area),
            "circularity": round(float(circularity), 3),
            "elongation": round(float(elongation), 3),
            "solidity": round(solidity, 3),
            "brightness": round(brightness, 1),
            "plastic_score": score,
            "is_plastic": score >= getattr(config, "PLASTIC_MIN_SCORE", 0.0),
            "bbox": (int(x), int(y), int(w), int(h)),
            "contour": c,
        })
    return particles


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def analyze_frame(frame_rgb):
    gray_full = _to_gray(frame_rgb)
    gray, offset = _crop_roi(gray_full)
    rgb_roi, _ = _crop_roi(frame_rgb)

    gray_eq = _illumination_fix(gray)
    glare = _glare_mask(gray)
    binary = _binarize(gray_eq)
    binary = cv2.bitwise_and(binary, glare)
    binary = _split_touching(binary)

    particles = _extract_particles(binary, gray, rgb_roi)

    plastic = [p for p in particles if p["is_plastic"]]
    debris = [p for p in particles if not p["is_plastic"]]
    count = len(plastic)

    areas = [p["area"] for p in plastic]
    roi_area = float(gray.shape[0] * gray.shape[1])

    small = sum(1 for a in areas if a < 8)
    medium = sum(1 for a in areas if 8 <= a < 40)
    large = sum(1 for a in areas if a >= 40)

    return {
        "count": count,
        "debris_count": len(debris),
        "density_per_megapixel": round(count / (roi_area / 1_000_000), 2) if roi_area else 0.0,
        "mean_area": round(float(np.mean(areas)), 2) if areas else 0.0,
        "size_small": small,
        "size_medium": medium,
        "size_large": large,
        "mean_circularity": round(float(np.mean([p["circularity"] for p in plastic])), 3) if plastic else 0.0,
        "mean_solidity": round(float(np.mean([p["solidity"] for p in plastic])), 3) if plastic else 0.0,
        "mean_plastic_score": round(float(np.mean([p["plastic_score"] for p in particles])), 3) if particles else 0.0,
        "mean_brightness": round(float(gray.mean()), 2),
        "_particles": particles,
        "_roi_offset": offset,
    }


_NUMERIC_KEYS = (
    "density_per_megapixel", "mean_area", "mean_circularity",
    "mean_solidity", "mean_plastic_score", "mean_brightness",
)


def analyze(frames):
    """Analyse several frames; aggregate for stability.

    Count = median across accepted frames (robust to a stray bubble drifting
    through one frame). Other numeric features = mean across frames.
    """
    accepted = []
    for frame in frames:
        ok, _ = assess_quality(frame)
        if ok:
            accepted.append((frame, analyze_frame(frame)))

    if not accepted:
        log.warning("No frame passed quality gate; using first frame unfiltered")
        frame = frames[0]
        feats = analyze_frame(frame)
        return feats, frame, feats

    counts = [f["count"] for _, f in accepted]
    median_count = int(np.median(counts))

    # Representative frame: the one whose count is closest to the median.
    best_frame, best_feats = min(
        accepted, key=lambda t: abs(t[1]["count"] - median_count))

    agg = dict(best_feats)
    agg["count"] = median_count
    for k in _NUMERIC_KEYS:
        agg[k] = round(float(np.mean([f[k] for _, f in accepted])), 3)
    for k in ("size_small", "size_medium", "size_large", "debris_count"):
        agg[k] = int(np.median([f[k] for _, f in accepted]))
    agg["frames_used"] = len(accepted)
    return agg, best_frame, best_feats


def annotate(frame_rgb, features, level=None, percent=None):
    """Green boxes = counted plastic-like particles, orange = excluded debris."""
    bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
    ox, oy = features.get("_roi_offset", (0, 0))
    for p in features.get("_particles", []):
        x, y, w, h = p["bbox"]
        colour = (0, 255, 0) if p.get("is_plastic", True) else (0, 165, 255)
        cv2.rectangle(bgr, (x + ox, y + oy), (x + ox + w, y + oy + h), colour, 1)
    header = f"count={features['count']}"
    if features.get("debris_count"):
        header += f"  debris={features['debris_count']}"
    if level:
        header += f"  level={level}"
    if percent is not None:
        header += f"  {percent:.0f}%"
    cv2.putText(bgr, header, (10, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                (0, 255, 255), 2, cv2.LINE_AA)
    return bgr
