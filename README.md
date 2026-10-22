<div align="center">

# 💧 HydroScan

### Making Microplastic Pollution Visible

A portable, offline, low-cost optical device that screens water for microplastic contamination on-site.
No lab, no chemicals, no internet.

[![Live Site](https://img.shields.io/badge/Live%20Site-hydro--scan--six.vercel.app-blue?style=flat&logo=vercel)](https://hydro-scan-six.vercel.app/)
[![Watch the Demo](https://img.shields.io/badge/Watch%20Demo-YouTube-red?style=flat&logo=youtube)](https://www.youtube.com/watch?v=5f7OmmbQsqY)
![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=flat&logo=python&logoColor=white)
![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi-4-C51A4A?style=flat&logo=raspberrypi&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-4.8%2B-5C3EE8?style=flat&logo=opencv&logoColor=white)

**Conrad Challenge 2025–26** · Anay Mehta & Yuvraj Nikum

</div>

---

## 📑 Contents

1. [Overview](#-overview)
2. [How It Works](#-how-it-works)
3. [Key Features](#-key-features)
4. [Project Structure](#-project-structure)
5. [Quick Start](#-quick-start)
6. [Hardware Setup](#-hardware-setup)
7. [Run on Boot](#-run-on-boot)
8. [Detection Pipeline](#-detection-pipeline)
9. [Machine Learning](#-machine-learning)
10. [Configuration & Tuning](#-configuration--tuning)
11. [Output Data](#-output-data)
12. [Troubleshooting](#-troubleshooting)
13. [Bill of Materials](#-bill-of-materials)
14. [Website](#-website)
15. [Team](#-team)
16. [License](#-license)

---

## 🌊 Overview

Microplastics are plastic particles smaller than 5 mm. They have been found in oceans, rivers, groundwater, bottled water, drinking water, and even human blood and tissue. Yet routine monitoring is rare, because standard methods (FTIR and Raman spectroscopy) need expensive lab equipment, trained staff, chemical preparation and per-sample fees.

> **When contamination cannot be measured, it is ignored.**

**HydroScan** is built on a **Raspberry Pi 4**, a **Camera Module v3 NOIR**, **white-LED illumination**, and **OpenCV**. It lights up a water sample, photographs it, counts suspended particles with computer vision, and shows a contamination level on a **16×2 LCD**:

| Level | Particle count* | What you see |
|:------|:----------------|:-------------|
| 🟢 **LOW** | fewer than 20 | Minimal scattering |
| 🟡 **MEDIUM** | 20 – 59 | Sparse, clearly detectable scattering |
| 🔴 **HIGH** | 60 or more | Dense, high-intensity scattering |

<sub>*Default thresholds for the rule-based fallback. Change them in `config.py`.</sub>

---

## ⚙️ How It Works

```
 Water sample ─► LED illumination ─► Camera capture ─► OpenCV detection ─► ML classifier ─► LCD result
```

1. **Sample placement:** water goes into a sealed transparent chamber that blocks ambient light.
2. **Illumination:** LEDs light the sample from fixed angles. Plastic particles scatter light differently from water.
3. **Image capture:** a fixed camera takes several frames of the scattering pattern.
4. **Detection:** OpenCV finds, separates and scores every particle (see [Detection Pipeline](#-detection-pipeline)).
5. **Classification:** a trained Random Forest model gives the contamination level and a confidence score, all offline.
6. **Result:** the LCD shows something like `HIGH  74%  n=74`. An annotated image and a log entry are also saved.

---

## ✨ Key Features

| Feature | Description |
|:--------|:------------|
| 📴 **Fully offline** | Everything runs on the Raspberry Pi. No cloud needed. |
| ♻️ **No consumables** | Reusable forever. Zero cost per test. |
| 🧪 **No chemicals** | Purely optical, non-destructive measurement. |
| 🎒 **Portable** | Runs from a USB-C power bank, so it works in the field. |
| 🧩 **Mock fallbacks** | LCD, button and LEDs fall back to console/keyboard if they aren't wired yet. |
| 🤖 **ML + safe fallback** | Uses the trained model, or simple threshold rules if the model is missing. |
| 💰 **Affordable** | About ₹8,000 in parts. |

---

## 📁 Project Structure

```
HydroScan/
├── main.py                    # App entry point: scan loop + offline image mode
├── config.py                  # All settings (pins, thresholds, paths)
├── requirements.txt           # Python dependencies
├── run.sh                     # Launcher: ./run.sh → python3 main.py
│
├── hydroscan/                 # Core package
│   ├── camera.py              # Picamera2 camera capture
│   ├── display.py             # 16×2 I2C LCD   (mock: prints to console)
│   ├── button.py              # Push button     (mock: keyboard)
│   ├── leds.py                # LED control     (mock: logs on/off)
│   ├── detector.py            # OpenCV detection pipeline
│   ├── classifier.py          # ML model with rule-based fallback
│   └── utils.py               # Logging, JSON log, helpers
│
├── ml/                        # Machine learning
│   ├── model.joblib           # Trained Random Forest (used by the app)
│   ├── features.csv           # Training features
│   ├── extract_features.py    # Images → feature table
│   ├── train_model.py         # Feature table → model
│   └── README.md              # ML details and roadmap
│
├── scripts/                   # Standalone tools
│   ├── test_camera.py         # Camera test
│   ├── test_lcd.py            # LCD test
│   ├── test_button_led.py     # Button + LED test
│   ├── reset_camera.py        # Reset camera white balance
│   └── generate_ml_dataset.py # Build a synthetic training dataset
│
├── systemd/
│   └── hydroscan.service      # Autostart on boot
│
├── web/                       # Project website (Next.js, deployed on Vercel)
│
└── data/
    ├── samples/               # Your own test images (optional)
    ├── captures/              # Raw frames from each scan
    └── results/               # Annotated images + scan_log.jsonl
```

---

## 🚀 Quick Start

> **Requirement:** a Raspberry Pi with the camera connected. The LCD, button and LEDs are optional at first.

```bash
# 1. Clone the repo
git clone https://github.com/AnayMehta976/HydroScan.git
cd HydroScan

# 2. Install dependencies
pip install -r requirements.txt --break-system-packages

# 3. Check the camera (saves data/captures/camera_test.jpg)
python3 scripts/test_camera.py

# 4. Run HydroScan
python3 main.py
```

### Run modes

| Command | What it does |
|:--------|:-------------|
| `python3 main.py` | Interactive mode. Type `scan` to take a reading. |
| `python3 main.py --button` | Uses the physical push button to start each scan. |
| `python3 main.py --once` | Takes one scan, prints the result, then exits. |
| `python3 main.py --image <path>` | Analyses a saved image. No camera needed. |
| `./run.sh` | Shortcut for `python3 main.py` (accepts the same flags). |

### Interactive commands

At the `hydroscan>` prompt:

| Command | Action |
|:--------|:-------|
| `scan` / `s` | Take a reading |
| `reset` / `r` | Reset camera colours (auto white balance) |
| `calib` / `c` | Run calibration |
| `quit` / `q` | Exit |

---

## 🔌 Hardware Setup

### 1. Flash the OS

1. Install **Raspberry Pi Imager** on your computer.
2. Flash **Raspberry Pi OS (64-bit)** to a microSD card (16 GB or larger).
3. In Imager's settings, enable **SSH** and enter your Wi-Fi details.
4. Boot the Pi from the card.

### 2. Enable I2C (for the LCD)

```bash
sudo raspi-config        # Interface Options → I2C → Enable
sudo reboot
```

The Camera v3 works out of the box. Check it with:

```bash
libcamera-hello --list-cameras
```

### 3. Wiring

All pins use **BCM numbering** and can be changed in `config.py`.

| Component | Connection | Notes |
|:----------|:-----------|:------|
| **Camera v3 NOIR** | CSI ribbon port | Blue side faces the Ethernet/USB ports |
| **16×2 I2C LCD** | SDA → GPIO2 (pin 3)<br>SCL → GPIO3 (pin 5)<br>VCC → 5V · GND → GND | Address is usually `0x27` (sometimes `0x3F`) |
| **Push button** | GPIO17 (pin 11) → button → GND | Uses the internal pull-up |
| **White LED / strip** | GPIO27 (pin 13) | Use a resistor for one LED, or a MOSFET for a strip |
| **Power** | USB-C power bank → Pi | |

Find your LCD's I2C address:

```bash
sudo apt install -y i2c-tools
i2cdetect -y 1           # set LCD_I2C_ADDRESS in config.py to the value shown
```

### 4. Test each part

```bash
python3 scripts/test_lcd.py          # shows test messages on the LCD
python3 scripts/test_camera.py       # saves a test photo
python3 scripts/test_button_led.py   # press the button → LED blinks
```

Each script prints `mock=True` or `mock=False`, so you can confirm the real hardware was detected.

---

## 🔁 Run on Boot

```bash
sudo cp systemd/hydroscan.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now hydroscan
journalctl -u hydroscan -f           # watch the logs
```

> The service runs as user `pi` from `/home/pi/HydroScan` in button mode. Edit `User=` and the paths in the service file if yours are different.

---

## 🔬 Detection Pipeline

`hydroscan/detector.py` runs these steps on every frame:

| # | Step | Purpose |
|:-:|:-----|:--------|
| 1 | **Grayscale + ROI crop** | Analyse only the water area (`config.ROI`) |
| 2 | **CLAHE** | Even out uneven LED lighting |
| 3 | **Glare masking** | Remove LED reflections so they aren't counted |
| 4 | **Top-hat + adaptive threshold** | Two detectors combined, so a pixel must pass both; cuts noise |
| 5 | **Watershed splitting** | Separate particles that are touching |
| 6 | **Plastic scoring** | Score each particle 0–1 by colour, shape and solidity; exclude sand and organic matter |
| 7 | **Multi-frame aggregation** | Median count and averaged features across good frames |

A **quality gate** rejects blurry, too-dark or over-exposed frames before counting.

In the annotated output image, **green** boxes are counted plastic and **orange** boxes are excluded debris.

---

## 🤖 Machine Learning

`hydroscan/classifier.py` loads the trained **Random Forest** at `ml/model.joblib`.

| Property | Value |
|:---------|:------|
| Classes | `clean` · `low` · `medium` · `high` · `non_plastic` |
| Training data | 500 images (100 per class) |
| Held-out accuracy | ~88% |
| Recall on HIGH | 100% |

If the model or scikit-learn is missing, it **falls back automatically** to simple rules:

```
count < 20  → LOW
count < 60  → MEDIUM
otherwise   → HIGH
```

Set `USE_ML_MODEL = False` in `config.py` to always use the rules.

### Retrain the model

```bash
python3 scripts/generate_ml_dataset.py                                     # 1. make a dataset
python3 ml/extract_features.py --dataset ml/dataset --out ml/features.csv  # 2. extract features
python3 ml/train_model.py --features ml/features.csv --out ml/model.joblib # 3. train
```

The app uses the new model the next time it starts. To train on real photos, sort your captures from `data/captures/` into `ml/dataset/<class>/` and run steps 2–3. See [`ml/README.md`](ml/README.md) for more.

> **What the % means:** it's a *relative contamination index*, not the literal share of plastic in the water. A count equal to `PERCENT_FULL_SCALE_COUNT` (default 100) reads as 100%.

---

## 🛠️ Configuration & Tuning

Every setting is in **`config.py`**.

| Problem | Fix |
|:--------|:----|
| Everything reads **HIGH** | Raise `MIN_PARTICLE_AREA` or `ADAPTIVE_C`, or make the `ROI` smaller |
| Everything reads **LOW** | Lower `ADAPTIVE_C` or `MIN_PARTICLE_AREA` |
| LED reflections counted | Make the `ROI` smaller, lower `MAX_PARTICLE_AREA`, or move the LEDs to the sides |
| Frames rejected as blurry | Lower `QUALITY_MIN_FOCUS`, or improve focus and lighting |
| Want to force mock/real hardware | Set `RUN_MODE` to `"mock"` or `"hardware"` (default `"auto"`) |

---

## 📊 Output Data

| Location | Contents |
|:---------|:---------|
| `data/captures/` | Raw image from each scan (`scan_YYYYMMDD_HHMMSS.jpg`) |
| `data/results/annotated_*.jpg` | Same image with particles boxed |
| `data/results/scan_log.jsonl` | One JSON line per scan (time, count, level, features). Opens easily in Excel or pandas. |

---

## 🧯 Troubleshooting

**Camera colours look wrong.** Reset the white balance:

```bash
python3 scripts/reset_camera.py
```

**LCD shows nothing.** Check the address with `i2cdetect -y 1` and set `LCD_I2C_ADDRESS` in `config.py`.

**RealVNC Viewer won't connect (Bookworm).** Bookworm uses Wayland by default. Go to `sudo raspi-config` → *Advanced Options* → *Wayland* → choose **X11**, reboot, then enable VNC under *Interface Options*. Or use **Raspberry Pi OS (Legacy) Bullseye**, which uses X11 by default.

---

## 💰 Bill of Materials

| Component | Cost (₹) |
|:----------|---------:|
| Raspberry Pi 4 | 4,000 |
| Camera Module v3 NOIR | 2,500 |
| 16×2 I2C LCD | 250 |
| White LEDs | 200 |
| Power components | 300 |
| Enclosure | 300 |
| Miscellaneous | 450 |
| **Total** | **≈ 8,000** |

---

## 🌐 Website

The project website lives in [`web/`](web/) and is built with **Next.js** and deployed on **Vercel**.

```bash
cd web
npm install
npm run dev              # open http://localhost:3000
```

> On Vercel, the project's **Root Directory** must be set to `web`.

---

## 👥 Team

| Member | Role |
|:-------|:-----|
| **Anay Mehta** | Hardware and prototyping. Led the enclosure design, optical chamber, illumination layout and electronics. |
| **Yuvraj Nikum** | System architecture, machine learning and software. Designed the optical analysis pipeline, trained the model, and integrated hardware with software. |

---

## 📄 License

This project is proprietary. All rights reserved © 2025–26 Anay Mehta & Yuvraj Nikum.

---

<div align="center">
<sub>⚠️ HydroScan is a <b>screening tool</b>, not a laboratory instrument. A HIGH reading means "investigate further," not a certified measurement.</sub>
</div>
