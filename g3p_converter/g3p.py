from __future__ import annotations

from dataclasses import dataclass
import zlib

from PIL import Image, ImageColor

G3P_WIDTH = 384
G3P_HEIGHT = 192
G3P_BPP = 16
G3P_TYPE_ID = b"\x3c\x1b"

_FILE_PREFIX = bytes.fromhex("AA AC BD AF 90 88 9A 8D")
_PICTURE_FILE_TYPE = 0x82
_METADATA_OFFSET = 0x20
_PIXEL_HEADER_OFFSET = 0xC0
_PAYLOAD_OFFSET = 0xD0
_OBFUSCATED_STREAM_OFFSET = 0xD2


@dataclass(frozen=True)
class G3PImage:
    width: int
    height: int
    bpp: int
    pixels_rgb565: bytes


def image_to_g3p(
    image: Image.Image,
    *,
    fit: str = "contain",
    background: str | tuple[int, int, int] = "#ffffff",
    resample: str = "lanczos",
) -> bytes:
    prepared = prepare_image(image, fit=fit, background=background, resample=resample)
    return encode_g3p_16bit(image_to_rgb565(prepared))


def prepare_image(
    image: Image.Image,
    *,
    fit: str = "contain",
    background: str | tuple[int, int, int] = "#ffffff",
    resample: str = "lanczos",
) -> Image.Image:
    image = image.convert("RGBA")
    resample_filter = _resample_filter(resample)

    if fit == "stretch":
        resized = image.resize((G3P_WIDTH, G3P_HEIGHT), resample_filter)
        return _flatten(resized, background)

    if fit == "center":
        canvas = _solid_canvas(background)
        x = (G3P_WIDTH - image.width) // 2
        y = (G3P_HEIGHT - image.height) // 2
        canvas.alpha_composite(image, dest=(x, y))
        return canvas.convert("RGB")

    if fit not in {"contain", "cover"}:
        raise ValueError(f"Unsupported fit mode: {fit}")

    sx = G3P_WIDTH / image.width
    sy = G3P_HEIGHT / image.height
    scale = min(sx, sy) if fit == "contain" else max(sx, sy)
    new_size = (
        max(1, round(image.width * scale)),
        max(1, round(image.height * scale)),
    )
    resized = image.resize(new_size, resample_filter)

    if fit == "cover":
        left = (resized.width - G3P_WIDTH) // 2
        top = (resized.height - G3P_HEIGHT) // 2
        cropped = resized.crop((left, top, left + G3P_WIDTH, top + G3P_HEIGHT))
        return _flatten(cropped, background)

    canvas = _solid_canvas(background)
    x = (G3P_WIDTH - resized.width) // 2
    y = (G3P_HEIGHT - resized.height) // 2
    canvas.alpha_composite(resized, dest=(x, y))
    return canvas.convert("RGB")


def image_to_rgb565(image: Image.Image) -> bytes:
    image = image.convert("RGB")
    if image.size != (G3P_WIDTH, G3P_HEIGHT):
        raise ValueError(f"Image must be {G3P_WIDTH}x{G3P_HEIGHT}, got {image.size}")

    out = bytearray(G3P_WIDTH * G3P_HEIGHT * 2)
    pos = 0
    for r, g, b in image.getdata():
        value = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
        out[pos] = value >> 8
        out[pos + 1] = value & 0xFF
        pos += 2
    return bytes(out)


def encode_g3p_16bit(pixels_rgb565: bytes) -> bytes:
    expected = G3P_WIDTH * G3P_HEIGHT * 2
    if len(pixels_rgb565) != expected:
        raise ValueError(f"Expected {expected} RGB565 bytes, got {len(pixels_rgb565)}")

    compressed = _raw_deflate(pixels_rgb565)
    checksum = (zlib.adler32(pixels_rgb565) & 0xFFFFFFFF).to_bytes(4, "big")
    obfuscated = bytes(_encode_obfuscated_byte(b) for b in compressed + checksum)
    image_data = G3P_TYPE_ID + obfuscated
    file_size = _PAYLOAD_OFFSET + len(image_data)

    header = _build_header(file_size)
    metadata = _build_metadata(file_size, len(image_data), G3P_BPP)
    return header + metadata + image_data


def decode_g3p_16bit(data: bytes) -> G3PImage:
    if len(data) < _PAYLOAD_OFFSET + 2:
        raise ValueError("File is too short to be a .g3p image")
    if data[:8] != _FILE_PREFIX:
        raise ValueError("Invalid .g3p signature")
    if data[8] != _PICTURE_FILE_TYPE:
        raise ValueError("Not a .g3p picture file")

    width = int.from_bytes(data[0xC2:0xC4], "big")
    height = int.from_bytes(data[0xC4:0xC6], "big")
    bpp = int.from_bytes(data[0xC6:0xC8], "big")
    if (width, height, bpp) != (G3P_WIDTH, G3P_HEIGHT, G3P_BPP):
        raise ValueError(f"Unsupported .g3p geometry/depth: {width}x{height}x{bpp}")
    if data[0xD0:0xD2] != G3P_TYPE_ID:
        raise ValueError("Only no-footer 3C1B .g3p images are supported")

    stream = bytes(_decode_obfuscated_byte(b) for b in data[_OBFUSCATED_STREAM_OFFSET:])
    if len(stream) < 5:
        raise ValueError("Compressed image stream is too short")

    compressed, stored_checksum = stream[:-4], stream[-4:]
    pixels = zlib.decompress(compressed, wbits=-15)
    computed_checksum = (zlib.adler32(pixels) & 0xFFFFFFFF).to_bytes(4, "big")
    if stored_checksum != computed_checksum:
        raise ValueError("Image checksum mismatch")

    expected = width * height * 2
    if len(pixels) != expected:
        raise ValueError(f"Unexpected image payload size: {len(pixels)}")
    return G3PImage(width=width, height=height, bpp=bpp, pixels_rgb565=pixels)


def _build_header(file_size: int) -> bytes:
    inverted_size = (~file_size) & 0xFFFFFFFF
    inv = inverted_size.to_bytes(4, "big")
    lsb = inv[3]

    header = bytearray(0x20)
    header[0:8] = _FILE_PREFIX
    header[0x08] = _PICTURE_FILE_TYPE
    header[0x09:0x0E] = bytes.fromhex("FF EF FF EF FF")
    header[0x0E] = (lsb + 0xBF) & 0xFF
    header[0x0F] = 0xFE
    header[0x10:0x14] = inv
    header[0x14] = (lsb + 0x48) & 0xFF
    header[0x1C] = (inv[2] + inv[3] + 0x9B) & 0xFF
    header[0x1D] = (lsb + 0x85) & 0xFF
    return bytes(header)


def _build_metadata(file_size: int, image_data_size: int, bpp: int) -> bytes:
    metadata = bytearray(_PAYLOAD_OFFSET - _METADATA_OFFSET)
    metadata[0x00:0x06] = bytes.fromhex("43 50 00 01 00 00")
    _write_u32(metadata, 0x10, file_size - 0x20)
    _write_u32(metadata, 0x14, 1)
    _write_u32(metadata, 0x18, file_size - 0xB8)
    metadata[0x98:0x9C] = bytes.fromhex("00 01 00 00")
    _write_u32(metadata, 0x9C, file_size - 0xCC)
    _write_u16(metadata, 0xA0, 0)
    _write_u16(metadata, 0xA2, G3P_WIDTH)
    _write_u16(metadata, 0xA4, G3P_HEIGHT)
    _write_u16(metadata, 0xA6, bpp)
    metadata[0xA8:0xAA] = bytes.fromhex("01 00")
    _write_u16(metadata, 0xAA, 0)
    _write_u32(metadata, 0xAC, image_data_size)
    return bytes(metadata)


def _raw_deflate(data: bytes) -> bytes:
    compressor = zlib.compressobj(level=9, method=zlib.DEFLATED, wbits=-15)
    return compressor.compress(data) + compressor.flush()


def _encode_obfuscated_byte(byte: int) -> int:
    inverted = (~byte) & 0xFF
    return ((inverted << 3) & 0xFF) | (inverted >> 5)


def _decode_obfuscated_byte(byte: int) -> int:
    unmixed = ((byte & 0x07) << 5) | ((byte & 0xF8) >> 3)
    return (~unmixed) & 0xFF


def _write_u16(buffer: bytearray, offset: int, value: int) -> None:
    buffer[offset : offset + 2] = value.to_bytes(2, "big")


def _write_u32(buffer: bytearray, offset: int, value: int) -> None:
    buffer[offset : offset + 4] = value.to_bytes(4, "big")


def _solid_canvas(color: str | tuple[int, int, int]) -> Image.Image:
    rgb = ImageColor.getrgb(color) if isinstance(color, str) else color
    return Image.new("RGBA", (G3P_WIDTH, G3P_HEIGHT), (*rgb[:3], 255))


def _flatten(image: Image.Image, background: str | tuple[int, int, int]) -> Image.Image:
    canvas = _solid_canvas(background)
    canvas.alpha_composite(image.convert("RGBA"), dest=(0, 0))
    return canvas.convert("RGB")


def _resample_filter(name: str) -> int:
    filters = {
        "nearest": Image.Resampling.NEAREST,
        "bilinear": Image.Resampling.BILINEAR,
        "bicubic": Image.Resampling.BICUBIC,
        "lanczos": Image.Resampling.LANCZOS,
    }
    try:
        return filters[name]
    except KeyError as exc:
        raise ValueError(f"Unsupported resample filter: {name}") from exc

