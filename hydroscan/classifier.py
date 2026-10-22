"""
Contamination classification (v2).

If a trained model exists at config.ML_MODEL_PATH (ml/model.joblib), the
Random Forest predicts the level (clean/low/medium/high/non_plastic) and its
predict_proba() becomes the confidence. If the model or its dependencies are
missing, the transparent threshold rules from v1 take over — the device never
stops working because of a missing file.

The output dict shape is identical either way, so main.py, the LCD and the
web app don't care which path produced it.
"""

import logging

import config

log = logging.getLogger("hydroscan.classifier")

# Model labels -> device levels shown on LCD/app.
_LABEL_TO_LEVEL = {
    "clean": "LOW",
    "low": "LOW",
    "medium": "MEDIUM",
    "high": "HIGH",
    "non_plastic": "LOW",   # debris, not plastic -> low *plastic* contamination
}

_model_cache = {"loaded": False, "model": None, "features": None}


def _load_model():
    """Load ml/model.joblib once; cache the result (even on failure)."""
    if _model_cache["loaded"]:
        return _model_cache["model"], _model_cache["features"]
    _model_cache["loaded"] = True
    if not getattr(config, "USE_ML_MODEL", False):
        return None, None
    path = getattr(config, "ML_MODEL_PATH", None)
    if not path or not path.exists():
        log.info("No ML model at %s - using threshold rules", path)
        return None, None
    try:
        import joblib
        bundle = joblib.load(path)
        _model_cache["model"] = bundle["model"]
        _model_cache["features"] = bundle["features"]
        log.info("Loaded ML model (%s, features=%s)",
                 type(bundle["model"]).__name__, bundle["features"])
    except Exception as exc:
        log.warning("Could not load ML model (%s) - using threshold rules", exc)
    return _model_cache["model"], _model_cache["features"]


def _percent(count):
    full = config.PERCENT_FULL_SCALE_COUNT
    return round(min(count / full * 100, 100.0), 1) if full else 0.0


def _classify_rules(features):
    count = features["count"]
    if count < config.LEVEL_LOW_MAX:
        level = "LOW"
    elif count < config.LEVEL_MEDIUM_MAX:
        level = "MEDIUM"
    else:
        level = "HIGH"

    cap = config.LEVEL_MEDIUM_MAX * 1.5
    score = min(count / cap, 1.0) if cap else 0.0

    boundaries = [config.LEVEL_LOW_MAX, config.LEVEL_MEDIUM_MAX]
    nearest = min(abs(count - b) for b in boundaries)
    confidence = round(min(0.5 + nearest / 20.0, 0.99), 2)

    return {
        "level": level,
        "count": count,
        "percent": _percent(count),
        "score": round(score, 3),
        "confidence": confidence,
        "method": "rules",
    }


def _classify_ml(features, model, feature_names):
    values = [float(features.get(name, 0.0)) for name in feature_names]
    try:
        import pandas as pd
        row = pd.DataFrame([values], columns=feature_names)
    except ImportError:
        row = [values]
    label = str(model.predict(row)[0])
    proba = model.predict_proba(row)[0]
    confidence = round(float(max(proba)), 2)

    level = _LABEL_TO_LEVEL.get(label, "MEDIUM")
    count = features["count"]

    result = {
        "level": level,
        "label": label,
        "count": count,
        "percent": _percent(count),
        "score": round(float(max(proba)), 3),
        "confidence": confidence,
        "method": "ml",
    }
    # Debris-dominated sample: surface that insight to the user.
    if label == "non_plastic":
        result["note"] = "Mostly non-plastic debris (sand/organic)"
    return result


def classify(features):
    """Map extracted features to a contamination level + percentage."""
    model, feature_names = _load_model()
    if model is not None:
        try:
            return _classify_ml(features, model, feature_names)
        except Exception as exc:
            log.warning("ML prediction failed (%s) - falling back to rules", exc)
    return _classify_rules(features)


def lcd_lines(result):
    """Two 16-char lines for the LCD."""
    line1 = "Microplastics"
    line2 = f"{result['level']} {result['percent']:.0f}% n{result['count']}"
    return line1[:16], line2[:16]
