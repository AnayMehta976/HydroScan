"""
16x2 I2C LCD abstraction (PCF8574 backpack, HD44780 controller).

Talks to the LCD over I2C using smbus2. If the bus/library/display is not
present, it falls back to printing the two lines to the console so you can see
exactly what the user would read on the screen.

The low-level HD44780 4-bit protocol is implemented inline so there is no extra
library to install beyond smbus2 (which ships with Raspberry Pi OS).
"""

import time
import logging

import config

log = logging.getLogger("hydroscan.display")

# HD44780 command bytes
_LCD_CLEAR = 0x01
_LCD_HOME = 0x02
_LCD_ENTRY = 0x06
_LCD_ON = 0x0C
_LCD_FUNCTION = 0x28   # 4-bit, 2 line, 5x8
_LCD_LINE = (0x80, 0xC0)  # DDRAM address for row 0 and row 1

_ENABLE = 0b00000100
_BACKLIGHT = 0b00001000


class _RealLCD:
    def __init__(self):
        from smbus2 import SMBus

        self._addr = config.LCD_I2C_ADDRESS
        self._bus = SMBus(config.LCD_I2C_BUS)
        self._init_display()
        log.info("Real I2C LCD initialised at 0x%02X", self._addr)

    # --- low level ---
    def _strobe(self, data):
        self._bus.write_byte(self._addr, data | _ENABLE | _BACKLIGHT)
        time.sleep(0.0005)
        self._bus.write_byte(self._addr, (data & ~_ENABLE) | _BACKLIGHT)
        time.sleep(0.0001)

    def _write4(self, data):
        self._bus.write_byte(self._addr, data | _BACKLIGHT)
        self._strobe(data)

    def _send(self, value, mode):
        # mode 0 = command, 1 = data
        self._write4(mode | (value & 0xF0))
        self._write4(mode | ((value << 4) & 0xF0))

    def _init_display(self):
        for cmd in (0x33, 0x32, _LCD_FUNCTION, _LCD_ON, _LCD_ENTRY, _LCD_CLEAR):
            self._send(cmd, 0)
        time.sleep(0.005)

    # --- public ---
    def show(self, line1="", line2=""):
        self._send(_LCD_CLEAR, 0)
        time.sleep(0.002)
        for row, text in enumerate((line1, line2)):
            self._send(_LCD_LINE[row], 0)
            for ch in text.ljust(config.LCD_COLS)[: config.LCD_COLS]:
                self._send(ord(ch), 1)

    def close(self):
        try:
            self._send(_LCD_CLEAR, 0)
            self._bus.close()
        except Exception:  # pragma: no cover
            pass


class _MockLCD:
    def __init__(self):
        log.warning("LCD hardware not available -> printing to console instead")

    def show(self, line1="", line2=""):
        bar = "+" + "-" * config.LCD_COLS + "+"
        print(bar)
        print("|" + line1.ljust(config.LCD_COLS)[: config.LCD_COLS] + "|")
        print("|" + line2.ljust(config.LCD_COLS)[: config.LCD_COLS] + "|")
        print(bar)

    def close(self):
        pass


class Display:
    """Public LCD object. Picks real or mock automatically."""

    def __init__(self):
        self.is_mock = True
        if config.RUN_MODE == "mock":
            self._impl = _MockLCD()
        else:
            try:
                self._impl = _RealLCD()
                self.is_mock = False
            except Exception as exc:
                if config.RUN_MODE == "hardware":
                    raise
                log.warning("Falling back to mock LCD: %s", exc)
                self._impl = _MockLCD()

    def show(self, line1="", line2=""):
        self._impl.show(line1, line2)

    def close(self):
        self._impl.close()
