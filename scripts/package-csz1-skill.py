#!/usr/bin/env python3
"""Refresh the two design snapshots and package only the CSZ1 skill resources."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import re
import zipfile

FILES = (
    "SKILL.md",
    "agents/openai.yaml",
    "references/design.md",
    "references/ideal.md",
    "references/project-map.md",
    "references/verification.md",
    "references/release.md",
    "assets/welcome-csz1.png",
    "assets/home-csz1.png",
)


def package(project: Path, output: Path):
    project = project.resolve(strict=True)
    output = output.resolve()
    if output.suffix.lower() != ".zip":
        raise ValueError("Output must be a .zip file")
    config = json.loads((project / "package.json").read_text(encoding="utf-8"))
    if config.get("name") != "hunan-agri-culture-map":
        raise ValueError("This is not the expected culture-map project")
    skill = project / "skills/csz1-agri-map"
    if not (skill / "SKILL.md").is_file():
        raise FileNotFoundError("Missing skills/csz1-agri-map/SKILL.md")

    # Project-root documents are the maintained source; skill copies are portable snapshots.
    for name in ("design.md", "ideal.md"):
        source = (project / name).read_text(encoding="utf-8")
        snapshot = source.replace("skills/csz1-agri-map/assets/", "../assets/")
        (skill / "references" / name).write_text(snapshot, encoding="utf-8")

    payload = {}
    for name in FILES:
        source = skill / name
        if source.is_symlink() or not source.resolve().is_relative_to(skill.resolve()):
            raise ValueError(f"Resource leaves skill folder: {name}")
        payload[name] = source.read_bytes()

    # All bundled local links must resolve within the same self-contained package.
    allowed = {(skill / name).resolve() for name in FILES}
    for name, data in payload.items():
        if not name.endswith(".md"):
            continue
        for link in re.findall(r"\[[^\]]*\]\(([^)]+)\)", data.decode("utf-8")):
            if re.match(r"^(https?://|mailto:|#)", link):
                continue
            target = ((skill / name).parent / link.split("#", 1)[0]).resolve()
            if target not in allowed:
                raise ValueError(f"Unbundled local link in {name}: {link}")

    manifest = {
        "skill": "csz1-agri-map",
        "website_version": "CSZ1版",
        "files": {name: hashlib.sha256(data).hexdigest() for name, data in payload.items()},
    }
    payload["manifest.json"] = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    archive_bytes = io.BytesIO()
    with zipfile.ZipFile(archive_bytes, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, data in payload.items():
            archive.writestr("csz1-agri-map/" + name, data)
    with zipfile.ZipFile(archive_bytes) as archive:
        if archive.testzip() is not None:
            raise ValueError("ZIP integrity check failed")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(archive_bytes.getvalue())
    print(json.dumps({"output": str(output), "files": len(payload), "bytes": output.stat().st_size}, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    package(args.project, args.output)
