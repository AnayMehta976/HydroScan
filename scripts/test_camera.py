#!/usr/bin/env python3
"""
Quick camera check. Captures one frame and saves it to data/captures/.
Works on real hardware or in mock mode.

Usage:  python3 scripts/test_camera.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config
from hydroscan.utils import setup_logging
from hydroscan.camera import Camera

setup_logging()
cam = Camera()
out = config.CAPTURE_DIR / "camera_test.jpg"
cam.capture_to_file(out)
cam.close()
print(f"Saved {out}  (mock={cam.is_mock})")
