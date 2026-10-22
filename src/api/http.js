'use strict';

const LIMITS = { auth: 16 * 1024, order: 128 * 1024, admin: 10 * 1024 * 1024 };

class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

function sendJson(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

function readJsonBody(req, limit) {
  return new Promise((resolve, reject) => {
    const type = String(req.headers['content-type'] || '').toLowerCase();
    const declared = Number(req.headers['content-length'] || 0);
    if (declared === 0 && !req.headers['transfer-encoding']) return resolve({});
    if (type && !type.includes('application/json') && !type.includes('text/plain')) {
      return reject(new HttpError(415, 'Content-Type must be application/json.'));
    }
    if (declared > limit) return reject(new HttpError(413, 'Request body is too large.'));

    const chunks = [];
    let size = 0;
    let aborted = false;
    req.on('data', chunk => {
      if (aborted) return;
      size += chunk.length;
      if (size > limit) {
        aborted = true;
        reject(new HttpError(413, 'Request body is too large.'));
        req.resume();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (aborted) return;
      if (!size) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return reject(new HttpError(400, 'JSON body must be an object.'));
        }
        resolve(parsed);
      } catch {
        reject(new HttpError(400, 'Malformed JSON body.'));
      }
    });
    req.on('error', err => {
      if (!aborted) reject(err);
    });
  });
}

module.exports = { LIMITS, HttpError, sendJson, readJsonBody };
