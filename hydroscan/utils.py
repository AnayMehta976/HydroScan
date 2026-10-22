"""
Small shared helpers: synthetic sample generation, logging setup, JSON logging.
"""

import json
import logging
from datetime import datetime

import numpy as np

import config


def setup_logging(level=logging.INFO):
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)-7s %(name)s | %(message)s",
        datefmt="%H:%M:%S",
    )


def _stamp_blob(img, cx, cy, radius, colour, rng, irregular=False, soft=False):
    """Draw one particle blob onto img (in place)."""
    height, width = img.shape[:2]
    yy, xx = np.ogrid[-radius:radius + 1, -radius:radius + 1]
    mask = xx * xx + yy * yy <= radius * radius
    if irregular:
        jitter = rng.normal(0, radius * 0.45, mask.shape)
        mask = (xx * xx + yy * yy + jitter) <= radius * radius

    y0, y1 = cy - radius, cy + radius + 1
    x0, x1 = cx - radius, cx + radius + 1
    if y0 < 0 or x0 < 0 or y1 > height or x1 > width:
        return
    region = img[y0:y1, x0:x1]
    if soft:
        # feathered edge: blend towards the colour
        dist = np.sqrt(xx * xx + yy * yy) / max(radius, 1)
        alpha = np.clip(1.2 - dist, 0, 1)[..., None]
        target = np.array(colour, dtype=np.float32)
        blended = region.astype(np.float32) * (1 - alpha) + target * alpha
        region[mask] = blended[mask].astype(np.uint8)
    else:
        for ch in range(3):
            region[..., ch][mask] = colour[ch]


def synthesize_sample(width=1280, height=720, n_particles=None, seed=None,
                      kind="plastic", realism=True):
    """
    Build a fake 'water sample under LED light' RGB frame.

    kind="plastic"  -> many small, bright, round specks (microplastic-like).
    kind="organic"  -> fewer, larger, irregular, brownish blobs (sand / soil /
                       plant matter). Used to build a 'non_plastic' training class
                       so the ML model learns to tell them apart.

    With realism=True (default) frames also get:
      * an uneven LED illumination gradient (random direction + strength)
      * occasional specular glare spots (like LED reflections)
      * a few air bubbles (bright rings, dark centres)
      * a sprinkle of organic debris in plastic frames (and vice versa),
        because real water is never a single particle type
      * random background tint/brightness so no two frames match exactly
    """
    rng = np.random.default_rng(seed)
    if n_particles is None:
        n_particles = int(rng.integers(5, 90))

    # --- background: dark water with random tint + brightness -------------
    base = np.array([18, 26, 40], dtype=np.float32)
    if realism:
        base = base + rng.normal(0, 5, 3) + rng.uniform(-6, 10)
        base = np.clip(base, 8, 70)
    img = np.zeros((height, width, 3), dtype=np.float32)
    img[:] = base

    # --- uneven LED illumination gradient ----------------------------------
    if realism:
        gy, gx = np.mgrid[0:height, 0:width].astype(np.float32)
        gx /= width
        gy /= height
        angle = rng.uniform(0, 2 * np.pi)
        strength = rng.uniform(4, 26)
        gradient = (np.cos(angle) * gx + np.sin(angle) * gy) * strength
        # radial hot-spot from the LED
        lx, ly = rng.uniform(0.15, 0.85), rng.uniform(0.15, 0.85)
        r = np.sqrt((gx - lx) ** 2 + (gy - ly) ** 2)
        hotspot = np.exp(-(r ** 2) / rng.uniform(0.08, 0.30)) * rng.uniform(6, 24)
        img += (gradient + hotspot)[..., None]

    noise = rng.normal(0, 6, (height, width, 3))
    img = np.clip(img + noise, 0, 255).astype(np.uint8)

    # --- particles ----------------------------------------------------------
    def _plastic_particle():
        cx = int(rng.integers(int(width * 0.12), int(width * 0.88)))
        cy = int(rng.integers(int(height * 0.12), int(height * 0.88)))
        radius = int(rng.integers(1, 5))
        b = int(rng.integers(170, 255))
        # slight colour cast: plastics aren't perfectly white
        tint = rng.integers(-15, 15, 3)
        colour = tuple(int(np.clip(b + t, 0, 255)) for t in tint)
        _stamp_blob(img, cx, cy, radius, colour, rng,
                    irregular=rng.random() < 0.25)

    def _organic_particle():
        cx = int(rng.integers(int(width * 0.12), int(width * 0.88)))
        cy = int(rng.integers(int(height * 0.12), int(height * 0.88)))
        radius = int(rng.integers(4, 12))
        colour = (int(rng.integers(90, 150)),
                  int(rng.integers(70, 120)),
                  int(rng.integers(40, 80)))
        _stamp_blob(img, cx, cy, radius, colour, rng, irregular=True)

    main_stamp = _organic_particle if kind == "organic" else _plastic_particle
    for _ in range(n_particles):
        main_stamp()

    if realism:
        # cross-contamination: a few particles of the other type
        other = _plastic_particle if kind == "organic" else _organic_particle
        for _ in range(int(rng.integers(0, max(2, n_particles // 8) + 1))):
            other()

        # air bubbles: bright ring with a dark centre
        import cv2
        for _ in range(int(rng.integers(0, 4))):
            bx = int(rng.integers(int(width * 0.15), int(width * 0.85)))
            by = int(rng.integers(int(height * 0.15), int(height * 0.85)))
            br = int(rng.integers(6, 16))
            cv2.circle(img, (bx, by), br, (int(rng.integers(120, 190)),) * 3, 2)
            cv2.circle(img, (bx, by), max(br - 3, 1), tuple(int(v) for v in base), -1)

        # specular glare spots (LED reflections)
        for _ in range(int(rng.integers(0, 3))):
            gx0 = int(rng.integers(int(width * 0.1), int(width * 0.9)))
            gy0 = int(rng.integers(int(height * 0.1), int(height * 0.9)))
            gr = int(rng.integers(10, 28))
            _stamp_blob(img, gx0, gy0, gr, (255, 255, 250), rng, soft=True)

        # gentle blur variation (focus differences between shots)
        if rng.random() < 0.35:
            k = int(rng.choice([3, 5]))
            img = cv2.GaussianBlur(img, (k, k), 0)

    return img


def log_result(result, image_name):
    """Append one scan result to data/results/scan_log.jsonl."""
    if not config.SAVE_JSON_LOG:
        return
    record = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "image": image_name,
        **result,
    }
    log_path = config.RESULT_DIR / "scan_log.jsonl"
    with open(log_path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")
