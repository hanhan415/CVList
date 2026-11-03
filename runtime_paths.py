"""Project-local temporary/cache directories; never alter system-wide settings."""
import sys
sys.dont_write_bytecode = True
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEMP_DIR = ROOT / ".tmp"
CACHE_DIR = ROOT / ".cache"
TEMP_DIR.mkdir(exist_ok=True)
CACHE_DIR.mkdir(exist_ok=True)
os.environ.update({
    "TMP": str(TEMP_DIR), "TEMP": str(TEMP_DIR), "TMPDIR": str(TEMP_DIR),
    "PIP_CACHE_DIR": str(CACHE_DIR / "pip"),
    "HF_HOME": str(CACHE_DIR / "huggingface"),
    "HF_HUB_CACHE": str(CACHE_DIR / "huggingface" / "hub"),
    "XDG_CACHE_HOME": str(CACHE_DIR),
    "PYTHONDONTWRITEBYTECODE": "1",
})
