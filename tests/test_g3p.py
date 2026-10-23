from __future__ import annotations

import unittest

from PIL import Image

from g3p_converter.g3p import (
    G3P_HEIGHT,
    G3P_WIDTH,
    decode_g3p_16bit,
    encode_g3p_16bit,
    image_to_g3p,
    image_to_rgb565,
)


class G3PTests(unittest.TestCase):
    def test_encode_decode_round_trip_rgb565(self) -> None:
        image = Image.new("RGB", (G3P_WIDTH, G3P_HEIGHT))
        for y in range(G3P_HEIGHT):
            for x in range(G3P_WIDTH):
                image.putpixel((x, y), (x % 256, y % 256, (x + y) % 256))

        pixels = image_to_rgb565(image)
        g3p = encode_g3p_16bit(pixels)
        decoded = decode_g3p_16bit(g3p)

        self.assertEqual(decoded.width, G3P_WIDTH)
        self.assertEqual(decoded.height, G3P_HEIGHT)
        self.assertEqual(decoded.bpp, 16)
        self.assertEqual(decoded.pixels_rgb565, pixels)

    def test_image_to_g3p_contain_resizes_to_screen(self) -> None:
        image = Image.new("RGB", (20, 10), "red")

        g3p = image_to_g3p(image, fit="contain", background="#000000")
        decoded = decode_g3p_16bit(g3p)

        self.assertEqual(len(decoded.pixels_rgb565), G3P_WIDTH * G3P_HEIGHT * 2)


if __name__ == "__main__":
    unittest.main()
