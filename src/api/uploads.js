'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const heicConvert = require('heic-convert');
const config = require('../config');
const store = require('../db');
const { cleanString, getClientIp } = require('../security');
const { LIMITS, HttpError, sendJson, readJsonBody } = require('./http');
const { requireAdmin } = require('./session');

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const IMAGE_MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  // iPhone photos: converted to JPEG on upload (browsers outside Apple devices cannot show HEIC).
  'image/heic': '.heic',
  'image/heif': '.heic'
};

const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1']);

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function hasValidImageMagicBytes(buf, ext) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return false;
  const ascii = (start, end) => buf.subarray(start, end).toString('ascii');
  switch (ext) {
    case '.jpg':
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case '.png':
      return buf.subarray(0, 8).equals(PNG_SIGNATURE);
    case '.gif':
      return ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a';
    case '.webp':
      return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
    case '.avif':
      return ascii(4, 8) === 'ftyp';
    case '.heic':
      return ascii(4, 8) === 'ftyp' && HEIC_BRANDS.has(ascii(8, 12));
    default:
      return false;
  }
}

function safeBaseName(filename) {
  return (
    cleanString(filename || 'photo', 80)
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
      .slice(0, 40) || 'photo'
  );
}

// Images are stored under DATA_DIR/uploads (the persistent volume) and served at /uploads/*.
async function uploadImage(req, res) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.admin);
  const dataUrl = String(body.dataUrl || '').trim();

  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp|gif|avif|heic|heif));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) {
    throw new HttpError(400, 'Unsupported image format. Please upload a JPG, PNG, WebP, GIF, AVIF or HEIC image.');
  }

  let ext = IMAGE_MIME_EXT[match[1].toLowerCase()];
  let buffer = Buffer.from(match[2], 'base64');

  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new HttpError(413, 'Image file size must be under 6 MB.');
  }
  if (!hasValidImageMagicBytes(buffer, ext)) {
    throw new HttpError(400, 'Uploaded file header does not match a valid image.');
  }
  if (ext === '.heic') {
    // ponytail: decoded in pure JS at full size (a 12 MP photo takes a few seconds and ~100 MB of
    // memory); resize here too if very large HEIC files become common.
    try {
      buffer = Buffer.from(await heicConvert({ buffer, format: 'JPEG', quality: 0.85 }));
    } catch {
      throw new HttpError(400, 'This HEIC photo could not be read. Please save it as JPG and try again.');
    }
    ext = '.jpg';
  }

  fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
  const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 10);
  const fileName = `${Date.now()}-${safeBaseName(body.filename)}-${hash}${ext}`;
  fs.writeFileSync(path.join(config.UPLOADS_DIR, fileName), buffer);

  store.logAudit(
    session.username,
    'media.uploaded',
    `Uploaded ${fileName} (${Math.round(buffer.length / 1024)} KB)`,
    getClientIp(req)
  );

  return sendJson(res, 201, {
    ok: true,
    url: `/uploads/${fileName}`,
    filename: fileName,
    sizeKb: Math.round((buffer.length / 1024) * 10) / 10
  });
}

module.exports = { uploadImage };
