"""
Camera abstraction - Raspberry Pi Camera via Picamera2 (hardware only).

Captures real frames from the connected camera. There is no mock/synthetic
fallback: if Picamera2 or the camera is unavailable, it raises a clear error.
On every start it re-enables automatic white balance and exposure, which also
clears any stuck colour cast from a previous run.
"""

import time
import logging

import numpy as np

import config

log = logging.getLogger("hydroscan.camera")


class Camera:
    def __init__(self):
        self.is_mock = False
        try:
            from picamera2 import Picamera2
        except ImportError as exc:
            raise RuntimeError(
                "Picamera2 not available - run HydroScan on the Raspberry Pi "
                "with the camera connected."
            ) from exc

        self._cam = Picamera2()
        cfg = self._cam.create_still_configuration(
            main={"size": config.CAMERA_RESOLUTION}
        )
        self._cam.configure(cfg)
        self._cam.start()
        self.reset_colours()
        time.sleep(config.CAMERA_WARMUP_SEC)
        log.info("Picamera2 initialised at %s (auto AWB/AE)", config.CAMERA_RESOLUTION)

    def reset_colours(self):
        """Re-enable auto white balance + exposure to clear a stuck colour cast."""
        try:
            self._cam.set_controls({"AwbEnable": True, "AeEnable": True})
        except Exception:  # pragma: no cover
            pass

    def capture_frame(self):
        """Capture a single RGB frame (used by the live-stream server)."""
        return np.asarray(self._cam.capture_array())

    def capture_frames(self, n=None):
        """Capture `n` frames and return them as a list of RGB numpy arrays."""
        n = n or config.CAMERA_FRAMES
        frames = []
        for _ in range(n):
            frames.append(np.asarray(self._cam.capture_array()))
            time.sleep(0.15)
        return frames

    def capture_to_file(self, path):
        """Capture a single frame and save it to `path`."""
        import cv2

        frame = np.asarray(self._cam.capture_array())
        cv2.imwrite(str(path), cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
        return path

    def close(self):
        try:
            self._cam.stop()
            self._cam.close()
        except Exception:  # pragma: no cover
            pass
