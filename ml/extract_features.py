#!/usr/bin/env python3
"""
ML stage 1 — feature extraction.

Walks a labelled dataset folder and writes a CSV of numeric features per image,
ready to train a classic ML model (Random Forest / SVM). This is the bridge from
the current rule-based system to a learned one.

Expected dataset layout (you create this over time):

    ml/dataset/
        clean/        *.jpg
        low/          *.jpg
        medium/       *.jpg
        high/         *.jpg
        non_plastic/  *.jpg     (sand, soil, organic — teaches 'not plastic')

Usage:
    python3 ml/extract_features.py --dataset ml/dataset --out ml/features.csv
"""
import sys
import csv
import argparse
from pathlib import Path

import cv2

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from hydroscan import detector  # noqa: E402

FEATURE_KEYS = [
    "count", "debris_count", "density_per_megapixel", "mean_area",
    "size_small", "size_medium", "size_large",
    "mean_circularity", "mean_solidity", "mean_plastic_score",
    "mean_brightness",
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="ml/dataset")
    ap.add_argument("--out", default="ml/features.csv")
    args = ap.parse_args()

    root = Path(args.dataset)
    if not root.exists():
        print(f"Dataset folder not found: {root}")
        print("Create it with subfolders per class (clean/ low/ medium/ high/ ...).")
        return

    rows = []
    for class_dir in sorted(p for p in root.iterdir() if p.is_dir()):
        label = class_dir.name
        for img_path in class_dir.glob("*"):
            if img_path.suffix.lower() not in (".jpg", ".jpeg", ".png", ".bmp"):
                continue
            bgr = cv2.imread(str(img_path))
            if bgr is None:
                continue
            rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            feats = detector.analyze_frame(rgb)
            row = {k: feats[k] for k in FEATURE_KEYS}
            row["label"] = label
            row["file"] = img_path.name
            rows.append(row)
            print(f"{label:12s} {img_path.name:30s} count={feats['count']}")

    if not rows:
        print("No images found. Add images to the class subfolders first.")
        return

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FEATURE_KEYS + ["label", "file"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"\nWrote {len(rows)} rows to {out}")


if __name__ == "__main__":
    main()
