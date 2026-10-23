from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

from .g3p import image_to_g3p


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="g3p-converter",
        description="Convert PNG/JPEG images to Casio fx-CG 16-bit .g3p files.",
    )
    parser.add_argument("input", type=Path, help="Input PNG/JPEG image")
    parser.add_argument("output", type=Path, help="Output .g3p file")
    parser.add_argument(
        "--fit",
        choices=("contain", "cover", "stretch", "center"),
        default="contain",
        help="How to fit the image into the 384x192 calculator screen",
    )
    parser.add_argument(
        "--background",
        default="#ffffff",
        help="Background color for contain/center fits, e.g. '#ffffff'",
    )
    parser.add_argument(
        "--resample",
        choices=("nearest", "bilinear", "bicubic", "lanczos"),
        default="lanczos",
        help="Resize filter",
    )

    args = parser.parse_args(argv)

    with Image.open(args.input) as image:
        g3p = image_to_g3p(
            image,
            fit=args.fit,
            background=args.background,
            resample=args.resample,
        )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(g3p)
    return 0

