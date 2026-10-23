import { deflateSync } from "fflate";

export const WIDTH = 384;
export const HEIGHT = 192;

const TYPE_ID = [0x3c, 0x1b];
const FILE_PREFIX = [0xaa, 0xac, 0xbd, 0xaf, 0x90, 0x88, 0x9a, 0x8d];

export async function encodeG3P(rgb565) {
  const compressed = await rawDeflate(rgb565);
  const checksum = adler32(rgb565);
  const stream = new Uint8Array(compressed.byteLength + 4);
  stream.set(compressed, 0);
  stream[compressed.byteLength] = checksum >>> 24;
  stream[compressed.byteLength + 1] = (checksum >>> 16) & 0xff;
  stream[compressed.byteLength + 2] = (checksum >>> 8) & 0xff;
  stream[compressed.byteLength + 3] = checksum & 0xff;

  const obfuscated = new Uint8Array(stream.length);
  for (let index = 0; index < stream.length; index += 1) {
    obfuscated[index] = encodeObfuscatedByte(stream[index]);
  }

  const imageDataSize = TYPE_ID.length + obfuscated.length;
  const fileSize = 0xd0 + imageDataSize;
  const file = new Uint8Array(fileSize);
  file.set(buildHeader(fileSize), 0);
  file.set(buildMetadata(fileSize, imageDataSize), 0x20);
  file.set(TYPE_ID, 0xd0);
  file.set(obfuscated, 0xd2);
  return file;
}

async function rawDeflate(bytes) {
  return deflateSync(bytes, { level: 9 });
}

function buildHeader(fileSize) {
  const header = new Uint8Array(0x20);
  header.set(FILE_PREFIX, 0);
  header[0x08] = 0x82;
  header.set([0xff, 0xef, 0xff, 0xef, 0xff], 0x09);
  const inverted = (~fileSize) >>> 0;
  const inv2 = (inverted >>> 8) & 0xff;
  const lsb = inverted & 0xff;
  header[0x0e] = (lsb + 0xbf) & 0xff;
  header[0x0f] = 0xfe;
  writeU32(header, 0x10, inverted);
  header[0x14] = (lsb + 0x48) & 0xff;
  header[0x1c] = (inv2 + lsb + 0x9b) & 0xff;
  header[0x1d] = (lsb + 0x85) & 0xff;
  return header;
}

function buildMetadata(fileSize, imageDataSize) {
  const metadata = new Uint8Array(0xb0);
  metadata.set([0x43, 0x50, 0x00, 0x01, 0x00, 0x00], 0x00);
  writeU32(metadata, 0x10, fileSize - 0x20);
  writeU32(metadata, 0x14, 1);
  writeU32(metadata, 0x18, fileSize - 0xb8);
  metadata.set([0x00, 0x01, 0x00, 0x00], 0x98);
  writeU32(metadata, 0x9c, fileSize - 0xcc);
  writeU16(metadata, 0xa0, 0);
  writeU16(metadata, 0xa2, WIDTH);
  writeU16(metadata, 0xa4, HEIGHT);
  writeU16(metadata, 0xa6, 16);
  metadata.set([0x01, 0x00], 0xa8);
  writeU16(metadata, 0xaa, 0);
  writeU32(metadata, 0xac, imageDataSize);
  return metadata;
}

function encodeObfuscatedByte(byte) {
  const inverted = (~byte) & 0xff;
  return ((inverted << 3) & 0xff) | (inverted >> 5);
}

function adler32(bytes) {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function writeU16(buffer, offset, value) {
  buffer[offset] = (value >>> 8) & 0xff;
  buffer[offset + 1] = value & 0xff;
}

function writeU32(buffer, offset, value) {
  buffer[offset] = (value >>> 24) & 0xff;
  buffer[offset + 1] = (value >>> 16) & 0xff;
  buffer[offset + 2] = (value >>> 8) & 0xff;
  buffer[offset + 3] = value & 0xff;
}
