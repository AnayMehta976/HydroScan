#!/usr/bin/env python3
"""
Generate a labelled synthetic dataset for the ML stage.

Creates ml/dataset/<class>/ folders filled with example images so you can run
the full ML training flow (extract_features.py -> train_model.py) immediately,
before you have collected real photos. Replace these with real images as you
gather them — the folder structure is identical.

Classes & particle ranges (tweak with the constants below):
    clean        : near-zero particles
    low          : a few plastic particles
    medium       : moderate
    high         : heavy
    non_plastic  : sand / soil / organic (large irregular brown blobs)

Usage:
    python3 scripts/generate_ml_dataset.py             # 100 images per class
    python3 scripts/generate_ml_dataset.py -n 30       # 30 per class
    python3 scripts/generate_ml_dataset.py --only high # one class only
"""
import sys
import argparse
from pathlib import Path

import cv2

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config
from hydroscan.utils import synthesize_sample

# class -> (kind, min_count, max_count)
CLASSES = {
    "clean":       ("plastic", 0, 5),
    "low":         ("plastic", 6, 19),
    "medium":      ("plastic", 22, 55),
    "high":        ("plastic", 65, 130),
    "non_plastic": ("organic", 8, 30),
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-n", type=int, default=100, help="images per class")
    ap.add_argument("--only", choices=list(CLASSES), default=None,
                    help="generate a single class")
    args = ap.parse_args()

    w, h = config.CAMERA_RESOLUTION
    dataset = config.BASE_DIR / "ml" / "dataset"
    total = 0

    classes = {args.only: CLASSES[args.only]} if args.only else CLASSES
    for cls, (kind, lo, hi) in classes.items():
        # class-specific seed base keeps images unique across classes and
        # reproducible per class regardless of --only
        seed = list(CLASSES).index(cls) * 10_000
        out_dir = dataset / cls
        out_dir.mkdir(parents=True, exist_ok=True)
        for i in range(args.n):
            import numpy as np
            rng = np.random.default_rng(seed)
            count = int(rng.integers(lo, hi + 1))
            img = synthesize_sample(width=w, height=h, n_particles=count,
                                    seed=seed, kind=kind)
            cv2.imwrite(str(out_dir / f"{cls}_{i:03d}.jpg"),
                        cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
            seed += 1
            total += 1
        print(f"{cls:12s}: {args.n} images  (count {lo}-{hi}, kind={kind})")

    print(f"\nWrote {total} images to {dataset}")
    print("Next:")
    print("  python3 ml/extract_features.py --dataset ml/dataset --out ml/features.csv")
    print("  python3 ml/train_model.py --features ml/features.csv --out ml/model.joblib")


if __name__ == "__main__":
    main()
