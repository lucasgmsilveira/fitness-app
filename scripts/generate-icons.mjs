import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve(import.meta.dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter none
    rgba.copy(raw, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function blendPixel(buf, width, height, x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= width || y >= height || a <= 0) return;
  const idx = (y * width + x) * 4;
  const alpha = Math.min(1, Math.max(0, a));
  const inv = 1 - alpha;
  buf[idx] = Math.round(r * alpha + buf[idx] * inv);
  buf[idx + 1] = Math.round(g * alpha + buf[idx + 1] * inv);
  buf[idx + 2] = Math.round(b * alpha + buf[idx + 2] * inv);
  buf[idx + 3] = 255;
}

function fillRoundedRect(buf, size, x0, y0, w, h, radius, color) {
  const [r, g, b] = color;
  const x1 = x0 + w;
  const y1 = y0 + h;
  for (let y = Math.floor(y0) - 1; y <= Math.ceil(y1) + 1; y++) {
    for (let x = Math.floor(x0) - 1; x <= Math.ceil(x1) + 1; x++) {
      const cx = Math.max(x0 + radius, Math.min(x + 0.5, x1 - radius));
      const cy = Math.max(y0 + radius, Math.min(y + 0.5, y1 - radius));
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.hypot(dx, dy) - radius;
      if (dist <= 0.5) {
        const cov = Math.min(1, Math.max(0, 0.5 - dist));
        blendPixel(buf, size, size, x, y, r, g, b, cov);
      }
    }
  }
}

function drawRingArc(buf, size, cx, cy, radius, thickness, startDeg, endDeg, color) {
  const [r, g, b] = color;
  const half = thickness / 2;
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.hypot(dx, dy);
      const ringDist = Math.abs(dist - radius) - half;
      if (ringDist > 1) continue;

      let angle = Math.atan2(dy, dx);
      if (angle < startRad) angle += Math.PI * 2;
      const inArc = angle >= startRad && angle <= endRad;

      let capDist = 999;
      if (!inArc) {
        const sx = cx + Math.cos(startRad) * radius;
        const sy = cy + Math.sin(startRad) * radius;
        const ex = cx + Math.cos(endRad) * radius;
        const ey = cy + Math.sin(endRad) * radius;
        capDist = Math.min(
          Math.hypot(x + 0.5 - sx, y + 0.5 - sy) - half,
          Math.hypot(x + 0.5 - ex, y + 0.5 - ey) - half
        );
      }

      const signed = inArc ? ringDist : capDist;
      if (signed <= 0.6) {
        const cov = Math.min(1, Math.max(0, 0.6 - signed));
        blendPixel(buf, size, size, x, y, r, g, b, cov);
      }
    }
  }
}

function renderIcon(size, maskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  // Fill background #0B0B0D
  for (let i = 0; i < size * size; i++) {
    buf[i * 4] = 11;
    buf[i * 4 + 1] = 11;
    buf[i * 4 + 2] = 13;
    buf[i * 4 + 3] = 255;
  }

  const scale = maskable ? 0.72 : 0.88;
  const cx = size / 2;
  const cy = size / 2;
  const u = (v) => (v / 512) * size * scale;
  const ox = cx - (256 / 512) * size * scale;
  const oy = cy - (256 / 512) * size * scale;

  // Base subtle ring #25252C
  drawRingArc(buf, size, cx, cy, u(184), u(24), 0, 360, [37, 37, 44]);
  // Active orange arc #F97316
  drawRingArc(buf, size, cx, cy, u(184), u(24), -90, 155, [249, 115, 22]);

  // Dumbbell bar #F4F4F6
  fillRoundedRect(buf, size, ox + u(136), oy + u(242), u(240), u(28), u(14), [244, 244, 246]);
  // Inner plates #84CC16
  fillRoundedRect(buf, size, ox + u(148), oy + u(196), u(32), u(120), u(10), [132, 204, 22]);
  fillRoundedRect(buf, size, ox + u(332), oy + u(196), u(32), u(120), u(10), [132, 204, 22]);
  // Outer plates #F97316
  fillRoundedRect(buf, size, ox + u(110), oy + u(214), u(26), u(84), u(8), [249, 115, 22]);
  fillRoundedRect(buf, size, ox + u(376), oy + u(214), u(26), u(84), u(8), [249, 115, 22]);

  return encodePng(size, size, buf);
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), renderIcon(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), renderIcon(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), renderIcon(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderIcon(180, false));
console.log('PWA icons generated in public/');
