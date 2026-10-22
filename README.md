# HydroScan

A portable, low-cost freshwater **microplastic screening** device built on a
Raspberry Pi 4, Camera Module v3 NOIR, white-LED illumination, and OpenCV.

It illuminates a water sample, photographs it, counts suspended particles with
computer vision, and reports a contamination level (**LOW / MEDIUM / HIGH**) on a
16×2 LCD.

> **Runs before your hardware is wired up.** Every hardware part (camera, LCD,
> button, LEDs) has an automatic **mock fallback**. So you can copy this onto the
> Pi today and run the *entire* pipeline using generated test images — then the
> moment you connect each real part, the code switches to it with no edits.

---

## 1. What's in this folder

```
HydroScan/
├── main.py                 # the app: scan loop + offline image mode
├── config.py               # ALL settings live here (pins, thresholds, paths)
├── requirements.txt        # Python dependencies
├── run.sh                  # ./run.sh  -> python3 main.py
│
├── hydroscan/              # the package
│   ├── camera.py           # Picamera2 (hardware)
│   ├── display.py          # 16x2 I2C LCD  (mock: prints to console)
│   ├── button.py           # push button  (mock: press ENTER)
│   ├── leds.py             # white LED control  (mock: logs on/off)
│   ├── detector.py         # OpenCV v2 pipeline (glare, watershed, plastic score)
│   ├── classifier.py       # ML model (ml/model.joblib) with rules fallback
│   ├── controller.py       # thread-safe scan controller (button + phone)
│   ├── server.py           # Flask web server: live feed + API + phone UI
│   └── utils.py            # logging, JSON log, synthetic sample generator
│
├── web/                    # the phone app (PWA: installable from browser)
│   ├── index.html          # live feed, scan button, gauge, history
│   ├── manifest.json / sw.js / icons/
│
├── android/                # native Android app project (build with Android Studio)
│
├── scripts/                # standalone tools
│   ├── setup_hotspot.sh         # Pi becomes a Wi-Fi hotspot for the phone
│   ├── ble_service.py           # Bluetooth LE discovery + latest result
│   ├── reset_camera.py          # reset camera colours (auto white balance)
│   ├── generate_ml_dataset.py   # make a labelled dataset for ML training
│   ├── test_camera.py
│   ├── test_lcd.py
│   └── test_button_led.py
│
├── ml/                     # machine-learning stage (LIVE — model in use)
│   ├── dataset/            # 100 labelled images per class (5 classes)
│   ├── model.joblib        # trained Random Forest, loaded by classifier.py
│   ├── features.csv
│   ├── extract_features.py
│   ├── train_model.py
│   └── README.md
│
├── systemd/
│   ├── hydroscan.service       # autostart phone app + button on boot
│   └── hydroscan-ble.service   # autostart Bluetooth advertising (optional)
│
└── data/
    ├── samples/   # optional: drop your own test images here
    ├── captures/  # raw frames from each scan
    └── results/   # annotated images + scan_log.jsonl
```

---

## 2. Quick start — run it on the Pi (camera connected)

The camera is hardware-only now (no synthetic/mock frames). The LCD, button and
LEDs still fall back to console/keyboard until they're wired, so you can run the
full scan loop with just the camera attached.

```bash
# 1. install dependencies
pip install -r requirements.txt --break-system-packages

# 2. check the camera works (saves data/captures/camera_test.jpg, mock=False)
python3 scripts/test_camera.py

# 3. run the app
python3 main.py
```

`HydroScan / System Ready` shows on the LCD (or as a console box if the LCD isn't
wired). Press the button — or **ENTER** if the button isn't wired — and it scans
a real frame and reports e.g. `HIGH  74%  n=74`.

Annotated output images and a `scan_log.jsonl` appear in `data/results/`.

**Camera colours look wrong?** Reset them (clears a stuck white balance):

```bash
python3 scripts/reset_camera.py
```

**Re-analyse an already-saved capture (no camera needed):**

```bash
python3 main.py --image data/captures/<some-saved-scan>.jpg
```

---

## 3. Full setup on the Raspberry Pi (with hardware)

### 3.1 Flash the OS

1. Install **Raspberry Pi Imager** on your PC.
2. Flash **Raspberry Pi OS (64-bit, Bookworm)** to a microSD card (16 GB+).
3. In Imager's settings (gear icon) enable **SSH**, set a username/password and
   your Wi-Fi — this lets you work headless.
4. Boot the Pi from the card.

### 3.2 Enable the camera and I2C

```bash
sudo raspi-config
```

* **Interface Options → I2C → Enable**  (for the LCD)
* The Camera v3 works out of the box on Bookworm via `libcamera`; no toggle
  needed. Verify with `libcamera-hello --list-cameras`.

Reboot: `sudo reboot`.

### 3.3 Get the code onto the Pi

Copy this whole `HydroScan` folder to `/home/pi/HydroScan` (USB stick, `scp`, or
`git clone`). Then:

```bash
cd /home/pi/HydroScan
pip install -r requirements.txt --break-system-packages
```

`picamera2`, `RPi.GPIO`, and `smbus2` ship with Raspberry Pi OS; the rest install
from the file.

### 3.4 Wire the hardware

Pins use **BCM numbering** and are set in `config.py` (change them there if you
wire differently).

| Part | Connects to | Notes |
|------|-------------|-------|
| **Camera v3 NOIR** | CSI ribbon port | blue side faces the Ethernet/USB jacks |
| **I2C LCD (16×2)** | SDA→GPIO2 (pin 3), SCL→GPIO3 (pin 5), VCC→5V, GND→GND | address usually `0x27` (some are `0x3F`) |
| **Push button** | one leg → GPIO17 (pin 11), other leg → GND | uses internal pull-up |
| **White LED / strip** | control → GPIO27 (pin 13), via a resistor (single LED) or a MOSFET gate (strip) | strip needs its own power + a transistor |
| **Power** | USB-C power bank → Pi USB-C | |

Find your LCD's I2C address:

```bash
sudo apt install -y i2c-tools
i2cdetect -y 1     # note the address shown, set LCD_I2C_ADDRESS in config.py
```

### 3.5 Test each part individually

```bash
python3 scripts/test_lcd.py          # cycles status messages on the LCD
python3 scripts/test_camera.py       # saves data/captures/camera_test.jpg
python3 scripts/test_button_led.py   # press button -> LED blinks
```

Each script prints `mock=True/False` so you can confirm the real hardware was
detected.

### 3.6 Run HydroScan

```bash
python3 main.py
```

Place a water sample in the chamber, press the button, read the LCD.

---

## 4. Autostart on boot (optional)

```bash
sudo cp systemd/hydroscan.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable hydroscan
sudo systemctl start hydroscan
journalctl -u hydroscan -f          # watch the logs
```

Edit `User=` / paths in the service file if your username or folder differ.

---

## 5. How detection works (v2 pipeline)

`hydroscan/detector.py` runs this pipeline on each frame:

1. **Grayscale + ROI crop** — analyse only the water (`config.ROI`).
2. **CLAHE illumination fix** — evens out the LED lighting so corners and
   centre threshold identically.
3. **Glare masking** — LED reflections (big saturated blobs) are detected and
   excluded so they're never counted as particles.
4. **White top-hat + adaptive threshold** — two independent detectors ANDed
   together; a pixel must look like a particle to both, which kills most noise.
5. **Watershed splitting** — touching particles are separated with a
   distance-transform watershed, so two specks stuck together count as two.
6. **Per-particle plastic scoring** — every blob gets a 0–1 "plastic score"
   from colour (bright/whitish vs brown/green), solidity and shape. Organic
   debris and sediment are excluded from the count (shown orange in the
   annotated image; counted plastic is green).
7. **Multi-frame aggregation** — median count + averaged features across all
   frames that pass the quality gate.

A **quality gate** (`assess_quality`) still rejects blurry / too-dark /
over-exposed frames before they're counted.

### Classification: trained ML model with a safe fallback

`hydroscan/classifier.py` first tries the trained Random Forest at
`ml/model.joblib` (500 labelled images, 5 classes, ~88% held-out accuracy and
100% recall on HIGH). Its `predict_proba` becomes the confidence, and a
`non_plastic` verdict tells you the sample is mostly sand/organic debris.

If the model file or scikit-learn is missing, it falls back automatically to
the transparent threshold rules:

```
count < 20    -> LOW
count < 60    -> MEDIUM
else          -> HIGH

percent = min(count / PERCENT_FULL_SCALE_COUNT * 100, 100)
```

So a scan reports e.g. `HIGH  74%  n=74` on the LCD, in the log, and in the
phone app. Set `USE_ML_MODEL = False` in `config.py` to force the rules.

> **What the % means.** It's a *relative contamination index*, not a literal
> "this much of the water is plastic" — no low-cost optical method can measure
> that. A count equal to `PERCENT_FULL_SCALE_COUNT` (default 100) reads as 100%.
> Set that constant in `config.py` to the dirtiest sample you realistically
> expect, so the scale is meaningful for your water source.

All these numbers live in `config.py` — tune them against real samples.

## 5b. Recommended operating system (and the VNC fix)

Use **Raspberry Pi OS** — not Ubuntu/DietPi — because `picamera2`, `RPi.GPIO`,
and the I2C tools this code needs all ship with it. For a lightweight setup that
also works cleanly with **RealVNC Viewer**, you have two good options:

* **Easiest VNC + lightest: Raspberry Pi OS (Legacy, 64-bit) "Bullseye" with
  desktop.** In Raspberry Pi Imager choose *Raspberry Pi OS (Legacy, 64-bit)*.
  It still uses **X11** and bundles the classic **RealVNC Server**, so RealVNC
  Viewer connects with no extra steps. `picamera2` works here too.

* **Current "Bookworm" + RealVNC:** Bookworm switched the desktop to **Wayland**,
  and that's why RealVNC Viewer stopped connecting — RealVNC Server was dropped
  from the image. Fix it one of two ways:
  1. Switch back to X11: `sudo raspi-config` → *Advanced Options* → *Wayland* →
     select **X11**, reboot, then enable VNC in *Interface Options*. RealVNC
     Viewer then works as before.
  2. Or keep Wayland and connect to the built-in **wayvnc** server (enable VNC in
     `raspi-config`). With older wayvnc you must **disable authentication** for
     RealVNC Viewer to connect, because wayvnc uses VeNCrypt/TLS that RealVNC
     Viewer doesn't support.

For a truly minimal, headless box you could use **Raspberry Pi OS Lite** (no
desktop) and skip VNC entirely — SSH in and run `python3 main.py`. But since you
want VNC, pick one of the desktop options above.

If your goal is just "lightweight and it runs this code," **Bullseye Legacy with
desktop** is the path of least resistance.

---

## 6. Tuning tips

* **Too many particles detected** (everything reads HIGH): raise
  `MIN_PARTICLE_AREA`, raise `ADAPTIVE_C`, or tighten the `ROI`.
* **Missing real particles** (everything reads LOW): lower `ADAPTIVE_C`, lower
  `MIN_PARTICLE_AREA`.
* **LED reflections counted as particles**: tighten the `ROI` and/or lower
  `MAX_PARTICLE_AREA`; reposition the LEDs to the sides, not facing the camera.
* **Frames rejected as blurry**: lower `QUALITY_MIN_FOCUS` or improve focus/lighting.

Force a mode regardless of hardware by setting `RUN_MODE` in `config.py` to
`"mock"` or `"hardware"` (default `"auto"`).

---

## 7. Where the data goes

* `data/captures/` — raw image from each scan (`scan_YYYYMMDD_HHMMSS.jpg`).
* `data/results/annotated_*.jpg` — same image with green boxes on detected particles.
* `data/results/scan_log.jsonl` — one JSON line per scan (timestamp, count, level,
  features). Easy to load into Excel/pandas later.

---

## 8. Machine learning — now live

The device ships with a trained Random Forest (`ml/model.joblib`) built from
**100 labelled images per class** (clean / low / medium / high / non_plastic,
500 total in `ml/dataset/`). The images are synthetic but realistic: uneven
LED lighting, glare spots, air bubbles, mixed debris, focus variation.

**Retrain any time** (e.g. after replacing synthetic images with real captures
from `data/captures/`):

```bash
python3 scripts/generate_ml_dataset.py            # regen synthetic (100/class)
python3 ml/extract_features.py --dataset ml/dataset --out ml/features.csv
python3 ml/train_model.py --features ml/features.csv --out ml/model.joblib
```

The app picks up the new model on next start — no code changes. See
[`ml/README.md`](ml/README.md) for the roadmap to real-photo training and
TFLite.

---

## 9. Phone app (Wi-Fi + Bluetooth)

The Pi hosts its own Wi-Fi hotspot and serves a full phone app: **live video
feed of the water, one-tap scan, contamination % gauge, history** — and the
physical button keeps working at the same time.

### One-time setup on the Pi

```bash
sudo bash scripts/setup_hotspot.sh     # Pi broadcasts Wi-Fi "HydroScan"
```

### Every use

```bash
python3 main.py --serve                # or enable the systemd service
```

On your phone: join Wi-Fi **HydroScan** (password `hydroscan123`, change it in
`scripts/setup_hotspot.sh`), then open **http://10.42.0.1:8080** in Chrome.
Tap *Add to Home screen* to install it as an app (icon, fullscreen, offline
shell).

If the Pi is on your home Wi-Fi instead of hotspot mode, use
`http://<pi-ip>:8080` — everything else is identical.

### Native Android app (optional)

`android/` contains a complete Android Studio project that wraps the same UI
in a real installable APK — see [`android/README.md`](android/README.md) for
the 3-step build.

### Bluetooth (optional)

`scripts/ble_service.py` advertises the device as **HydroScan** over Bluetooth
LE and serves the latest scan result (JSON) to any BLE app — useful for
discovering the device before joining its Wi-Fi. Live video always travels
over Wi-Fi; BLE bandwidth is far too small for video.

```bash
sudo apt install -y python3-dbus bluez
pip install bluezero --break-system-packages
python3 scripts/ble_service.py                     # or hydroscan-ble.service
```

---

## 10. Bill of materials (~₹8,000)

| Component | Cost (₹) |
|-----------|---------:|
| Raspberry Pi 4 | 4000 |
| Camera v3 NOIR | 2500 |
| 16×2 I2C LCD | 250 |
| White LEDs | 200 |
| Power components | 300 |
| Enclosure | 300 |
| Miscellaneous | 450 |
| **Total** | **~8000** |

---

*HydroScan is a preliminary screening tool, not a laboratory instrument. A HIGH
reading means "investigate further," not a certified contamination measurement.*
