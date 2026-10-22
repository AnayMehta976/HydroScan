#!/usr/bin/env python3
"""
HydroScan - main application (detection system).

Default mode is an interactive terminal: type 'scan' to analyse the water
sample. It illuminates, captures real frames, runs the OpenCV microplastic
detection + ML classifier, prints LEVEL / contamination% / particle count, and
auto-opens the annotated image (green = plastic-like, orange = debris).

Commands at the 'hydroscan>' prompt:
    scan   - capture + analyse the current sample
    reset  - reset the camera colours (auto white balance)
    calib  - show this sample's raw count + how to calibrate thresholds
    quit   - exit

Other ways to run:
    python3 main.py --once          # one scan then exit
    python3 main.py --image PATH    # analyse an existing image, no camera
    python3 main.py --button        # use the physical push button (when wired)
"""

import sys
import time
import shutil
import logging
import argparse
import subprocess
from datetime import datetime

import cv2

import config
from hydroscan import camera as cam_mod
from hydroscan import display as disp_mod
from hydroscan import button as btn_mod
from hydroscan import leds as led_mod
from hydroscan import detector, classifier
from hydroscan.utils import setup_logging, log_result

log = logging.getLogger("hydroscan.main")


def _timestamp():
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def _open_image(path):
    """Open an image in the Pi's default viewer (best effort, non-blocking)."""
    for opener in ("xdg-open", "feh", "eog", "gpicview"):
        if shutil.which(opener):
            try:
                subprocess.Popen(
                    [opener, str(path)],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                )
                return True
            except Exception:
                pass
    return False


def run_scan(camera, display, leds, save=True):
    """Perform one full scan. Returns (result_dict, annotated_path_or_None)."""
    display.show("Scanning...", "Please wait")
    leds.on()
    time.sleep(0.4)

    frames = camera.capture_frames()
    leds.off()

    display.show("Processing...", "")
    agg, best_frame, best_feats = detector.analyze(frames)
    result = classifier.classify(agg)

    ts = _timestamp()
    image_name = f"scan_{ts}.jpg"
    annotated_path = None
    if save:
        cv2.imwrite(str(config.CAPTURE_DIR / image_name),
                    cv2.cvtColor(best_frame, cv2.COLOR_RGB2BGR))
        if config.SAVE_ANNOTATED:
            annotated = detector.annotate(best_frame, best_feats,
                                          result["level"], result["percent"])
            annotated_path = config.RESULT_DIR / f"annotated_{ts}.jpg"
            cv2.imwrite(str(annotated_path), annotated)

    public = {k: v for k, v in agg.items() if not k.startswith("_")}
    public.update(result)
    log_result(public, image_name)

    l1, l2 = classifier.lcd_lines(result)
    display.show(l1, l2)
    return result, annotated_path


def _print_result(result):
    print("\n  ---------------- RESULT ----------------")
    print(f"   Microplastic level : {result['level']}")
    print(f"   Contamination      : {result['percent']:.1f}%")
    print(f"   Particle count     : {result['count']}")
    print(f"   Confidence         : {result['confidence']}")
    if result.get("note"):
        print(f"   Note               : {result['note']}")
    print("  ----------------------------------------\n")


def analyse_image_only(path, open_image=True):
    """Offline mode: run the pipeline on a single saved image, no camera."""
    setup_logging()
    img_bgr = cv2.imread(path)
    if img_bgr is None:
        log.error("Could not read image: %s", path)
        sys.exit(1)
    frame_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    agg, best_frame, best_feats = detector.analyze([frame_rgb])
    result = classifier.classify(agg)
    annotated = detector.annotate(best_frame, best_feats,
                                  result["level"], result["percent"])
    out = config.RESULT_DIR / f"annotated_{_timestamp()}.jpg"
    cv2.imwrite(str(out), annotated)
    _print_result(result)
    print(f"  Annotated image: {out}")
    if open_image:
        _open_image(out)


def _calibrate(camera, display, leds):
    """Scan the current sample and report the raw count + how to tune thresholds."""
    result, _ = run_scan(camera, display, leds, save=False)
    print("\n  --- CALIBRATION ---")
    print(f"   This sample's particle count: {result['count']}")
    print(f"   Current bands:  LOW < {config.LEVEL_LOW_MAX}"
          f"   MEDIUM < {config.LEVEL_MEDIUM_MAX}   HIGH >= {config.LEVEL_MEDIUM_MAX}")
    print(f"   100% point: count = {config.PERCENT_FULL_SCALE_COUNT}")
    print("   To recalibrate, edit these in config.py:")
    print("     LEVEL_LOW_MAX, LEVEL_MEDIUM_MAX, PERCENT_FULL_SCALE_COUNT")
    print("   Tip: scan clean water (should read LOW) and dirty water, then set")
    print("   the bands between those counts.\n")


def command_loop(camera, display, leds):
    display.show(config.APP_NAME, "Type 'scan'")
    print("\n" + "=" * 44)
    print(f" {config.APP_NAME} ready.")
    print(" Commands:  scan | reset | calib | quit")
    print("=" * 44)
    while True:
        try:
            cmd = input("hydroscan> ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            break
        if cmd in ("scan", "s"):
            result, annotated = run_scan(camera, display, leds)
            _print_result(result)
            if annotated and _open_image(annotated):
                print(f"  (opened {annotated.name})")
        elif cmd in ("reset", "r"):
            camera.reset_colours()
            print("  Camera colours reset (auto white balance re-enabled).")
        elif cmd in ("calib", "c"):
            _calibrate(camera, display, leds)
        elif cmd in ("quit", "q", "exit"):
            break
        elif cmd in ("help", "h", ""):
            print("  Commands:  scan | reset | calib | quit")
        else:
            print(f"  Unknown command '{cmd}'. Try: scan | reset | calib | quit")


def button_loop(camera, display, leds, button):
    """Physical-button loop (use --button once the button is wired)."""
    while True:
        display.show(config.APP_NAME, "Press to scan")
        button.wait_for_press()
        result, annotated = run_scan(camera, display, leds)
        _print_result(result)
        if annotated:
            _open_image(annotated)
        time.sleep(2.0)


def main():
    parser = argparse.ArgumentParser(description="HydroScan microplastic scanner")
    parser.add_argument("--once", action="store_true", help="one scan then exit")
    parser.add_argument("--image", metavar="PATH",
                        help="analyse an existing image instead of the camera")
    parser.add_argument("--button", action="store_true",
                        help="use the physical push button instead of typing 'scan'")
    args = parser.parse_args()

    if args.image:
        analyse_image_only(args.image)
        return

    setup_logging()
    log.info("Starting %s v%s", config.APP_NAME,
             __import__("hydroscan").__version__)

    camera = cam_mod.Camera()
    display = disp_mod.Display()
    leds = led_mod.Leds()
    button = btn_mod.Button() if args.button else None

    try:
        if args.once:
            result, annotated = run_scan(camera, display, leds)
            _print_result(result)
            if annotated:
                _open_image(annotated)
        elif args.button:
            button_loop(camera, display, leds, button)
        else:
            command_loop(camera, display, leds)
    except KeyboardInterrupt:
        print()
        log.info("Shutting down")
    finally:
        leds.close()
        if button:
            button.close()
        camera.close()
        display.show("HydroScan", "Powered off")
        display.close()


if __name__ == "__main__":
    main()
