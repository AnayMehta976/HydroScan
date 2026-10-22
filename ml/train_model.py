#!/usr/bin/env python3
"""
ML stage 2 — train a classifier from the extracted features.

Trains a Random Forest on ml/features.csv and saves it to ml/model.joblib.
Light enough to also run inference on the Raspberry Pi.

Requires: pip install scikit-learn joblib pandas

Usage:
    python3 ml/train_model.py --features ml/features.csv --out ml/model.joblib

To plug the trained model into HydroScan later, load it in classifier.classify()
and return the predicted label + predict_proba() as the confidence. The rest of
the app (main.py, LCD output) needs no changes because the interface is the same.
"""
import argparse


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--features", default="ml/features.csv")
    ap.add_argument("--out", default="ml/model.joblib")
    args = ap.parse_args()

    try:
        import pandas as pd
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import classification_report
        import joblib
    except ImportError:
        print("Install training deps first:")
        print("    pip install scikit-learn joblib pandas --break-system-packages")
        return

    df = pd.read_csv(args.features)
    feature_cols = [c for c in df.columns if c not in ("label", "file")]
    X = df[feature_cols]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    clf = RandomForestClassifier(n_estimators=200, random_state=42)
    clf.fit(X_train, y_train)

    print("\n=== Held-out performance ===")
    print(classification_report(y_test, clf.predict(X_test)))

    joblib.dump({"model": clf, "features": feature_cols}, args.out)
    print(f"Saved model to {args.out}")


if __name__ == "__main__":
    main()
