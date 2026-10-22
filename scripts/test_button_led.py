#!/usr/bin/env python3
"""
Button + LED check. Waits for a button press (or ENTER in mock mode), then
blinks the LED. Press Ctrl+C to stop.

Usage:  python3 scripts/test_button_led.py
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from hydroscan.utils import setup_logging
from hydroscan.button import Button
from hydroscan.leds import Leds

setup_logging()
btn = Button()
leds = Leds()
print(f"button mock={btn.is_mock}, led mock={leds.is_mock}")
try:
    while True:
        btn.wait_for_press()
        print("Press detected -> LED on for 1s")
        leds.on()
        time.sleep(1.0)
        leds.off()
except KeyboardInterrupt:
    pass
finally:
    leds.close()
    btn.close()
