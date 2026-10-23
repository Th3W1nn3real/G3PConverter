import { HEIGHT, WIDTH } from "./g3p.js";

export const QUALITY_PROFILES = {
  photo: {
    smoothing: true,
    progressive: true,
    sharpen: 0.14,
    contrast: 1,
    saturation: 1.02,
    brightness: 0,
    dither: 0.78,
  },
  crisp: {
    smoothing: true,
    progressive: true,
    sharpen: 0.34,
    contrast: 1.08,
    saturation: 1.1,
    brightness: 0,
    dither: 0.42,
  },
  diagram: {
    smoothing: true,
    progressive: true,
    sharpen: 0.38,
    contrast: 1.06,
    saturation: 1,
    brightness: 0,
    dither: 0.18,
  },
  text: {
    smoothing: true,
    progressive: true,
    sharpen: 0.56,
    contrast: 1.16,
    saturation: 1,
    brightness: 0,
    dither: 0,
  },
  pixel: {
    smoothing: false,
    progressive: false,
    sharpen: 0,
    contrast: 1,
    saturation: 1,
    brightness: 0,
    dither: 0,
  },
};

export function processImage({ bitmap, fit, background, profileId, tune }) {
  const baseProfile = QUALITY_PROFILES[profileId] ?? QUALITY_PROFILES.photo;
  const profile = { ...baseProfile, ...tune };
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  drawFittedBitmap(context, bitmap, fit, profile);

  let imageData = context.getImageData(0, 0, WIDTH, HEIGHT);
  if (profile.contrast !== 1 || profile.saturation !== 1 || profile.brightness !== 0) {
    imageData = adjustTone(imageData, profile);
  }
  if (profile.sharpen > 0) imageData = sharpenImageData(imageData, profile.sharpen);

  return quantizeToRgb565(imageData, profile.dither, profile);
}

function drawFittedBitmap(context, bitmap, fit, profile) {
  const frame = calculateFrame(bitmap, fit);
  context.imageSmoothingEnabled = profile.smoothing;
  context.imageSmoothingQuality = "high";

  if (!profile.progressive || !profile.smoothing) {
    context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, frame.x, frame.y, frame.w, frame.h);
    return;
  }

  const resized = progressiveResize(bitmap, Math.max(1, frame.w), Math.max(1, frame.h));
  context.drawImage(resized, frame.x, frame.y);
}

function calculateFrame(bitmap, fit) {
  let w = bitmap.width;
  let h = bitmap.height;
  let x = Math.floor((WIDTH - w) / 2);
  let y = Math.floor((HEIGHT - h) / 2);

  if (fit === "stretch") {
    return { x: 0, y: 0, w: WIDTH, h: HEIGHT };
  }

  if (fit === "contain" || fit === "cover") {
    const scale =
      fit === "contain"
        ? Math.min(WIDTH / bitmap.width, HEIGHT / bitmap.height)
        : Math.max(WIDTH / bitmap.width, HEIGHT / bitmap.height);
    w = Math.max(1, Math.round(bitmap.width * scale));
    h = Math.max(1, Math.round(bitmap.height * scale));
    x = Math.floor((WIDTH - w) / 2);
    y = Math.floor((HEIGHT - h) / 2);
  }

  return { x, y, w, h };
}

function progressiveResize(source, targetWidth, targetHeight) {
  let current = source;
  let currentWidth = source.width;
  let currentHeight = source.height;

  while (currentWidth * 0.5 > targetWidth * 1.35 || currentHeight * 0.5 > targetHeight * 1.35) {
    currentWidth = Math.max(targetWidth, Math.round(currentWidth * 0.5));
    currentHeight = Math.max(targetHeight, Math.round(currentHeight * 0.5));
    current = drawToCanvas(current, currentWidth, currentHeight, true);
  }

  return drawToCanvas(current, targetWidth, targetHeight, true);
}

function drawToCanvas(source, width, height, smoothing) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = smoothing;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

function adjustTone(imageData, profile) {
  const data = new Uint8ClampedArray(imageData.data);
  const midpoint = 128;
  for (let index = 0; index < data.length; index += 4) {
    let r = midpoint + (data[index] - midpoint) * profile.contrast + profile.brightness;
    let g = midpoint + (data[index + 1] - midpoint) * profile.contrast + profile.brightness;
    let b = midpoint + (data[index + 2] - midpoint) * profile.contrast + profile.brightness;

    if (profile.saturation !== 1) {
      const luma = r * 0.2126 + g * 0.7152 + b * 0.0722;
      r = luma + (r - luma) * profile.saturation;
      g = luma + (g - luma) * profile.saturation;
      b = luma + (b - luma) * profile.saturation;
    }

    data[index] = clampByte(r);
    data[index + 1] = clampByte(g);
    data[index + 2] = clampByte(b);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

function sharpenImageData(imageData, amount) {
  const source = imageData.data;
  const out = new Uint8ClampedArray(source);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const offset = (y * width + x) * 4;
      const up = offset - width * 4;
      const down = offset + width * 4;
      const left = offset - 4;
      const right = offset + 4;

      for (let channel = 0; channel < 3; channel += 1) {
        const center = source[offset + channel];
        const neighbors =
          source[up + channel] +
          source[down + channel] +
          source[left + channel] +
          source[right + channel];
        out[offset + channel] = clampByte(center * (1 + 4 * amount) - neighbors * amount);
      }
    }
  }

  return new ImageData(out, width, height);
}

function quantizeToRgb565(imageData, ditherStrength, profile) {
  const { data, width, height } = imageData;
  const work = new Float32Array(width * height * 3);
  const preview = new Uint8ClampedArray(width * height * 4);
  const rgb565 = new Uint8Array(width * height * 2);

  for (let source = 0, target = 0; source < data.length; source += 4, target += 3) {
    work[target] = data[source];
    work[target + 1] = data[source + 1];
    work[target + 2] = data[source + 2];
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const color = pixel * 3;
      const previewOffset = pixel * 4;
      const fileOffset = pixel * 2;

      const r = clampByte(work[color]);
      const g = clampByte(work[color + 1]);
      const b = clampByte(work[color + 2]);
      const q = quantizeColor(r, g, b);

      preview[previewOffset] = q.r8;
      preview[previewOffset + 1] = q.g8;
      preview[previewOffset + 2] = q.b8;
      preview[previewOffset + 3] = 255;
      rgb565[fileOffset] = q.value >> 8;
      rgb565[fileOffset + 1] = q.value & 0xff;

      if (ditherStrength > 0) {
        diffuseError(work, width, height, x, y, color, r - q.r8, g - q.g8, b - q.b8, ditherStrength);
      }
    }
  }

  return {
    rgb565,
    preview: new ImageData(preview, width, height),
    profile,
  };
}

function quantizeColor(r, g, b) {
  const r5 = r >> 3;
  const g6 = g >> 2;
  const b5 = b >> 3;
  const value = (r5 << 11) | (g6 << 5) | b5;
  return {
    value,
    r8: (r5 << 3) | (r5 >> 2),
    g8: (g6 << 2) | (g6 >> 4),
    b8: (b5 << 3) | (b5 >> 2),
  };
}

function diffuseError(work, width, height, x, y, offset, er, eg, eb, strength) {
  distribute(work, width, height, x + 1, y, offset + 3, er, eg, eb, (7 / 16) * strength);
  distribute(work, width, height, x - 1, y + 1, offset + (width - 1) * 3, er, eg, eb, (3 / 16) * strength);
  distribute(work, width, height, x, y + 1, offset + width * 3, er, eg, eb, (5 / 16) * strength);
  distribute(work, width, height, x + 1, y + 1, offset + (width + 1) * 3, er, eg, eb, (1 / 16) * strength);
}

function distribute(work, width, height, x, y, offset, er, eg, eb, factor) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  work[offset] += er * factor;
  work[offset + 1] += eg * factor;
  work[offset + 2] += eb * factor;
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}
