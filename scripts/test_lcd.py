#!/usr/bin/env python3
"""
LCD check. Cycles through the status messages HydroScan shows during a scan.
Real LCD on I2C, or printed boxes in mock mode.

Usage:  python3 scripts/test_lcd.py
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from hydroscan.utils import setup_logging
from hydroscan.display import Display

setup_logging()
lcd = Display()
for l1, l2 in [
    ("HydroScan", "System Ready"),
    ("Scanning...", "Please wait"),
    ("Processing...", ""),
    ("Microplastics", "LOW  n=12"),
    ("Microplastics", "HIGH n=84"),
]:
    lcd.show(l1, l2)
    time.sleep(1.2)
lcd.close()
print(f"Done  (mock={lcd.is_mock})")
