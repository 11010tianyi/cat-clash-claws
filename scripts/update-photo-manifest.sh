#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)/images/scenes/photos"
cd "$DIR"
python3 - <<'PY'
import json
from pathlib import Path
exts = {".jpg", ".jpeg", ".png", ".webp"}
files = sorted(p.name for p in Path(".").iterdir() if p.is_file() and p.suffix.lower() in exts)
Path("manifest.json").write_text(json.dumps(files, indent=2) + "\n", encoding="utf-8")
print("Wrote", len(files), "files")
PY
