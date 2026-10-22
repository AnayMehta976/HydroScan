#!/usr/bin/env bash
# Convenience launcher for HydroScan.
# Usage: ./run.sh
set -e
cd "$(dirname "$0")"
python3 main.py "$@"
