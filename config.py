"""
HydroScan – Central configuration.

Every tunable value lives here so you never have to dig through the code.
Edit the numbers, save, and re-run. Nothing else needs to change.
"""

from pathlib import Path

# --------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CAPTURE_DIR = DATA_DIR / "captures"
RESULT_DIR = DATA_DIR / "results"
SAMPLE_DIR = DATA_DIR / "samples"

for _d in (CAPTURE_DIR, RESULT_DIR, SAMPLE_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# --------------------------------------------------------------------------
# Run mode: "auto" | "hardware" | "mock"
# --------------------------------------------------------------------------
RUN_MODE = "auto"

# --------------------------------------------------------------------------
# Camera
# --------------------------------------------------------------------------
CAMERA_RESOLUTION = (1280, 720)
CAMERA_FRAMES = 3
CAMERA_WARMUP_SEC = 2.0

# --------------------------------------------------------------------------
# GPIO pin map (BCM numbering)
# --------------------------------------------------------------------------
BUTTON_PIN = 17
LED_PIN = 27
BUTTON_BOUNCE_MS = 250

# --------------------------------------------------------------------------
# I2C LCD (16x2)
# --------------------------------------------------------------------------
LCD_I2C_ADDRESS = 0x27
LCD_I2C_BUS = 1
LCD_COLS = 16
LCD_ROWS = 2

# --------------------------------------------------------------------------
# Detection pipeline (OpenCV)
# --------------------------------------------------------------------------
GAUSSIAN_KERNEL = (5, 5)
THRESHOLD_VALUE = 120
THRESHOLD_MAX = 255
USE_ADAPTIVE_THRESHOLD = True
ADAPTIVE_BLOCK_SIZE = 35
ADAPTIVE_C = 5

MIN_PARTICLE_AREA = 2
MAX_PARTICLE_AREA = 5000

ROI = (0.10, 0.10, 0.90, 0.90)

# --- v2 pipeline upgrades ---------------------------------------------------
# CLAHE evens out LED illumination before thresholding.
USE_CLAHE = True
CLAHE_CLIP_LIMIT = 2.0
CLAHE_TILE_GRID = (8, 8)

# White top-hat isolates small bright particles from a slowly-varying
# background (much more robust to uneven lighting than thresholding alone).
USE_TOPHAT = True
TOPHAT_KERNEL_SIZE = 15

# Specular glare (LED reflections) — pixels this bright over a blob this big
# are masked out so reflections are never counted as particles.
GLARE_BRIGHTNESS = 245
GLARE_MIN_AREA = 60
GLARE_DILATE = 5

# Split touching particles with a distance-transform watershed.
USE_WATERSHED = True
WATERSHED_MIN_AREA = 30        # only blobs bigger than this get split
WATERSHED_FG_RATIO = 0.45      # sure-foreground threshold on distance map

# Per-particle plastic-vs-debris filter (colour + shape heuristics).
# Bright, low-saturation, compact specks score high (plastic-like);
# brown/green, saturated, ragged blobs score low (organic/sediment).
USE_PLASTIC_FILTER = True
PLASTIC_MIN_SCORE = 0.40       # particles below this count as debris
DEBRIS_SATURATION = 90         # HSV saturation above this looks organic
DEBRIS_MIN_SOLIDITY = 0.55     # solidity below this looks organic/ragged

# --------------------------------------------------------------------------
# Classification thresholds
# --------------------------------------------------------------------------
LEVEL_LOW_MAX = 20
LEVEL_MEDIUM_MAX = 60

PERCENT_FULL_SCALE_COUNT = 100

# --------------------------------------------------------------------------
# Image quality gate
# --------------------------------------------------------------------------
QUALITY_MIN_FOCUS = 50.0
QUALITY_MIN_BRIGHTNESS = 18
QUALITY_MAX_BRIGHTNESS = 230

# --------------------------------------------------------------------------
# ML classifier
# --------------------------------------------------------------------------
# If this file exists, classifier.py uses the trained model; otherwise it
# falls back to the transparent threshold rules below.
ML_MODEL_PATH = BASE_DIR / "ml" / "model.joblib"
USE_ML_MODEL = True

# --------------------------------------------------------------------------
# Web server (phone app)
# --------------------------------------------------------------------------
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8080
STREAM_FPS = 8                 # live-feed frame rate (keep modest on Pi 4)
STREAM_JPEG_QUALITY = 70
HISTORY_LIMIT = 50             # scans shown in the phone app history

# --------------------------------------------------------------------------
# Bluetooth (BLE) — optional device discovery + latest result
# --------------------------------------------------------------------------
BLE_DEVICE_NAME = "HydroScan"
BLE_SERVICE_UUID = "12634d89-d598-4874-8e86-7d042ee07ba7"
BLE_RESULT_CHAR_UUID = "12634d8a-d598-4874-8e86-7d042ee07ba7"

# --------------------------------------------------------------------------
# Misc
# --------------------------------------------------------------------------
APP_NAME = "HydroScan"
SAVE_ANNOTATED = True
SAVE_JSON_LOG = True
