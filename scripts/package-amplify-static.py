from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

PROJECT = Path(__file__).resolve().parent.parent
SOURCE = PROJECT / "out"
DESTINATION = PROJECT / "clientops-memory-ai-amplify.zip"

if not (SOURCE / "index.html").is_file():
    raise SystemExit("out/index.html is missing; run npm run build:static first")

files = sorted(path for path in SOURCE.rglob("*") if path.is_file())
relative_files = [path.relative_to(SOURCE).as_posix() for path in files]

if not any(path.startswith("_next/static/") and path.endswith(".css") for path in relative_files):
    raise SystemExit("Static CSS bundle is missing")
if not any(path.startswith("_next/static/") and path.endswith(".js") for path in relative_files):
    raise SystemExit("Static JavaScript bundles are missing")

with ZipFile(DESTINATION, "w", ZIP_DEFLATED) as archive:
    for source, relative in zip(files, relative_files, strict=True):
        archive.write(source, relative)

with ZipFile(DESTINATION) as archive:
    names = archive.namelist()
    if "index.html" not in names or any(name.startswith("./") or "\\" in name for name in names):
        raise SystemExit("Amplify archive path validation failed")

print(f"Created {DESTINATION.name} with {len(files)} normalized file entries")
