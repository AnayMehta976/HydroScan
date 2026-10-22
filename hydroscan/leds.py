"""
White LED illumination control.

Real mode: drives config.LED_PIN HIGH/LOW via RPi.GPIO. For a small LED this can
be direct; for an LED strip drive a MOSFET / transistor from this pin.

Mock mode: logs on/off so you can follow the scan sequence without hardware.
"""

import logging

import config

log = logging.getLogger("hydroscan.leds")


class _RealLeds:
    def __init__(self):
        import RPi.GPIO as GPIO

        self._GPIO = GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(config.LED_PIN, GPIO.OUT, initial=GPIO.LOW)
        log.info("Real LED control on GPIO%d", config.LED_PIN)

    def on(self):
        self._GPIO.output(config.LED_PIN, self._GPIO.HIGH)

    def off(self):
        self._GPIO.output(config.LED_PIN, self._GPIO.LOW)

    def close(self):
        try:
            self.off()
        except Exception:  # pragma: no cover
            pass


class _MockLeds:
    def __init__(self):
        log.warning("LED hardware not available -> logging on/off only")

    def on(self):
        log.info("[mock LED] ON")

    def off(self):
        log.info("[mock LED] OFF")

    def close(self):
        pass


class Leds:
    def __init__(self):
        self.is_mock = True
        if config.RUN_MODE == "mock":
            self._impl = _MockLeds()
        else:
            try:
                self._impl = _RealLeds()
                self.is_mock = False
            except Exception as exc:
                if config.RUN_MODE == "hardware":
                    raise
                log.warning("Falling back to mock LEDs: %s", exc)
                self._impl = _MockLeds()

    def on(self):
        self._impl.on()

    def off(self):
        self._impl.off()

    def close(self):
        self._impl.close()
