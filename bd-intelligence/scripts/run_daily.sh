#!/bin/zsh
set -euo pipefail

cd /Users/walsh/Jobstodoincodex/bd-intelligence

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

.venv/bin/python -m pip install -q -r requirements.txt
.venv/bin/python -m src.cli daily-run

