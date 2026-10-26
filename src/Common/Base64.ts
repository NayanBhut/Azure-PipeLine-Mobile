/* eslint-disable no-bitwise -- base64 encoding is bit manipulation by definition */
/**
 * UTF-8 aware Base64 encoder.
 *
 * React Native does not ship `btoa`, and the `base-64` package that was
 * previously used is unmaintained. Keeping this tiny implementation removes a
 * third-party dependency from the credential path.
 */
const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toUtf8Bytes(value: string): number[] {
  const bytes: number[] = [];

  for (let i = 0; i < value.length; i++) {
    let codePoint = value.charCodeAt(i);

    // Combine surrogate pairs into a single code point.
    if (
      codePoint >= 0xd800 &&
      codePoint <= 0xdbff &&
      i + 1 < value.length
    ) {
      const next = value.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        codePoint = (codePoint - 0xd800) * 0x400 + (next - 0xdc00) + 0x10000;
        i++;
      }
    }

    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }

  return bytes;
}

export function base64Encode(value: string): string {
  const bytes = toUtf8Bytes(value);
  let encoded = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const byte1 = bytes[i];
    const byte2 = i + 1 < bytes.length ? bytes[i + 1] : undefined;
    const byte3 = i + 2 < bytes.length ? bytes[i + 2] : undefined;

    encoded += BASE64_ALPHABET[byte1 >> 2];

    if (byte2 === undefined) {
      encoded += BASE64_ALPHABET[(byte1 & 0x03) << 4];
      encoded += '==';
      break;
    }

    encoded += BASE64_ALPHABET[((byte1 & 0x03) << 4) | (byte2 >> 4)];

    if (byte3 === undefined) {
      encoded += BASE64_ALPHABET[(byte2 & 0x0f) << 2];
      encoded += '=';
      break;
    }

    encoded += BASE64_ALPHABET[((byte2 & 0x0f) << 2) | (byte3 >> 6)];
    encoded += BASE64_ALPHABET[byte3 & 0x3f];
  }

  return encoded;
}
