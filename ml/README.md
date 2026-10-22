# HydroScan – Machine Learning (LIVE)

**The trained model is now in use.** `hydroscan/classifier.py` loads
`ml/model.joblib` automatically (Random Forest, 5 classes, trained on the 500
images in `ml/dataset/` — ~88% held-out accuracy, 100% precision/recall on
HIGH). If the model file is missing it falls back to the transparent
rule-based classifier, so the device always works.

The current dataset is synthetic (100 realistic images per class with uneven
lighting, glare, bubbles and mixed debris). **Replace it with real captures
from `data/captures/` over time and retrain** — that's the single biggest
accuracy win available.

## The plan

1. **Collect labelled images.** As you scan real water, the raw frames are saved
   in `data/captures/`. Sort them into `ml/dataset/<class>/`:

   ```
   ml/dataset/
     clean/        water with almost no particles
     low/          a few plastic particles
     medium/       moderate contamination
     high/         heavy contamination
     non_plastic/  sand, soil, organic matter (teaches "not plastic")
   ```

   **Don't have real images yet?** Generate a synthetic starter dataset so you
   can run the whole flow today:

   ```
   python3 scripts/generate_ml_dataset.py -n 30   # 30 images per class
   ```

   Replace these with real photos as you collect them — the folder layout is
   identical, so nothing else changes.

2. **Extract features** → numeric table:

   ```
   python3 ml/extract_features.py --dataset ml/dataset --out ml/features.csv
   ```

3. **Train a model:**

   ```
   pip install scikit-learn joblib pandas --break-system-packages
   python3 ml/train_model.py --features ml/features.csv --out ml/model.joblib
   ```

4. **Deploy.** Load `ml/model.joblib` inside `hydroscan/classifier.py::classify()`
   and return the predicted label plus `predict_proba()` as the confidence /
   probability. Nothing else in the app changes — `main.py` and the LCD output
   already speak the same `{level, count, score, confidence}` interface.

## Why start with Random Forest

* Trains in seconds on a few hundred images.
* Runs inference on the Raspberry Pi 4 with no GPU.
* Easy to explain to judges and easy to inspect (feature importances).

Deep models (MobileNet / EfficientNet via TensorFlow Lite) are the natural next
step once you have thousands of labelled images, but they are not needed to get
a real, measurable accuracy improvement over the rule-based baseline.

## Target metrics for deployment

* Accuracy > 85%
* Recall > 90% (don't miss contaminated samples)
* Precision > 85%
