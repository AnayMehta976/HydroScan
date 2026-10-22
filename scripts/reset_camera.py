#!/usr/bin/env python3
"""
Reset the Raspberry Pi camera's colours.

If the camera's image has gone weird (pink/green/blue tint, washed out), it's
almost always a stuck auto-white-balance or exposure lock. This script re-opens
the camera with automatic white balance and exposure ENABLED, lets it settle,
and saves a fresh test image so you can confirm the colours are normal again.

Run on the Pi:
    python3 scripts/reset_camera.py

Then open data/captures/reset_test.jpg in VNC.
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config

try:
    from picamera2 import Picamera2
except ImportError:
    print("Picamera2 not found — run this on the Raspberry Pi with the camera connected.")
    sys.exit(1)

import cv2
import numpy as np

cam = Picamera2()
cfg = cam.create_still_configuration(main={"size": config.CAMERA_RESOLUTION})
cam.configure(cfg)
cam.start()

# Re-enable automatic white balance + exposure -> clears any stuck colour cast.
cam.set_controls({"AwbEnable": True, "AeEnable": True})
print("Letting auto white balance / exposure settle...")
time.sleep(2.5)

frame = np.asarray(cam.capture_array())
out = config.CAPTURE_DIR / "reset_test.jpg"
cv2.imwrite(str(out), cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
cam.stop()
cam.close()

print(f"\nSaved {out}")
print("Open it in VNC:")
print("  - Colours look right  -> camera is reset, you're good.")
print("  - Red and blue swapped -> tell Claude to flip the colour order in camera.py.")
print("  - Still tinted/odd     -> reboot the Pi (sudo reboot) and run this again.")
