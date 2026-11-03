"""Refresh project-local documentation and a small source-only archive on D."""
import sys
sys.dont_write_bytecode = True
import runtime_paths
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent
out = root / "outputs"
out.mkdir(exist_ok=True)
(out / "CVList-使用说明.md").write_text((root / "README.md").read_text("utf-8"), "utf-8")
files = [p for p in root.iterdir() if p.is_file() and p.suffix in (".mjs", ".py", ".json", ".md", ".txt", ".ps1", ".html")]
files += [root / ".gitignore", root / ".npmrc"]
for folder in ("scripts", "lib", "web/dist"):
    files += [p for p in (root / folder).glob("*") if p.is_file()]
with zipfile.ZipFile(out / "CVList-脚本源码.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for file in files:
        archive.write(file, Path("CVList") / file.relative_to(root))
print("Updated D-drive documentation and source archive, including webpage source.")
