"""
Push-button input.

Real mode: reads a momentary button on config.BUTTON_PIN (BCM) using RPi.GPIO,
with an internal pull-up (wire the other leg of the button to GND).

Mock mode: there is no physical button, so wait_for_press() simply waits for the
user to press ENTER in the terminal. That keeps the scan loop fully usable
before the hardware exists.
"""

import time
import logging

import config

log = logging.getLogger("hydroscan.button")


class _RealButton:
    def __init__(self):
        import RPi.GPIO as GPIO

        self._GPIO = GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(config.BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        self._edge_ok = True   # newer kernels break wait_for_edge -> poll
        log.info("Real button on GPIO%d", config.BUTTON_PIN)

    def _wait_polling(self):
        """Poll the pin (pulled-up: LOW = pressed). Works on all kernels."""
        while self._GPIO.input(config.BUTTON_PIN):
            time.sleep(0.03)
        time.sleep(config.BUTTON_BOUNCE_MS / 1000.0)  # debounce
        while not self._GPIO.input(config.BUTTON_PIN):
            time.sleep(0.03)  # wait for release so one press = one scan

    def wait_for_press(self):
        if self._edge_ok:
            try:
                # Falling edge: pulled-up pin goes LOW when pressed.
                self._GPIO.wait_for_edge(
                    config.BUTTON_PIN,
                    self._GPIO.FALLING,
                    bouncetime=config.BUTTON_BOUNCE_MS,
                )
                return
            except RuntimeError as exc:
                self._edge_ok = False
                log.warning("Edge detection unavailable (%s) - "
                            "switching to polling", exc)
        self._wait_polling()

    def close(self):
        try:
            self._GPIO.cleanup(config.BUTTON_PIN)
        except Exception:  # pragma: no cover
            pass


class _MockButton:
    def __init__(self):
        log.warning("Button hardware not available -> press ENTER to scan")

    def wait_for_press(self):
        try:
            input("\n[mock button] Press ENTER to start a scan (Ctrl+C to quit)... ")
        except EOFError:
            # Non-interactive context (e.g. piped) -> behave like a single press.
            pass

    def close(self):
        pass


class Button:
    def __init__(self):
        self.is_mock = True
        if config.RUN_MODE == "mock":
            self._impl = _MockButton()
        else:
            try:
                self._impl = _RealButton()
                self.is_mock = False
            except Exception as exc:
                if config.RUN_MODE == "hardware":
                    raise
                log.warning("Falling back to mock button: %s", exc)
                self._impl = _MockButton()

    def wait_for_press(self):
        self._impl.wait_for_press()

    def close(self):
        self._impl.close()
