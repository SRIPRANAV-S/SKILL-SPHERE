const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, getPixel) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawScanlines[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawScanlines[offset++] = Math.round(Math.max(0, Math.min(255, r)));
      rawScanlines[offset++] = Math.round(Math.max(0, Math.min(255, g)));
      rawScanlines[offset++] = Math.round(Math.max(0, Math.min(255, b)));
      rawScanlines[offset++] = Math.round(Math.max(0, Math.min(255, a)));
    }
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Supersampling anti-aliasing renderer
function renderIcon(size, isMaskable = false) {
  // SkillSphere brand colors
  // Ink background: #0F1117 (15, 17, 23)
  // Teal sphere: #4FD8C4 (79, 216, 196)
  // Amber sphere: #F2B84B (242, 184, 75)
  // Gradient / blend in middle

  const samples = 3; // 3x3 supersampling
  const sampleStep = 1 / samples;

  return createPng(size, size, (px, py) => {
    let accR = 0, accG = 0, accB = 0, accA = 0;

    for (let sy = 0; sy < samples; sy++) {
      for (let sx = 0; sx < samples; sx++) {
        const x = (px + (sx + 0.5) * sampleStep) / size; // 0..1
        const y = (py + (sy + 0.5) * sampleStep) / size; // 0..1

        // Safe area scaling: if maskable, keep content inside 80% safe zone
        const scale = isMaskable ? 0.72 : 0.85;
        const cx = 0.5;
        const cy = 0.5;
        const nx = (x - cx) / scale + cx;
        const ny = (y - cy) / scale + cy;

        // Background: Deep dark #0F1117
        let bgR = 15, bgG = 17, bgB = 23, bgA = 1.0;

        // Center 1: Teal sphere at (0.40, 0.50), radius 0.23
        const c1x = 0.40, c1y = 0.50, r1 = 0.23;
        const d1 = Math.hypot(nx - c1x, ny - c1y);
        const alpha1 = Math.max(0, Math.min(1, (r1 - d1) * size * scale));

        // Center 2: Amber sphere at (0.60, 0.50), radius 0.23
        const c2x = 0.60, c2y = 0.50, r2 = 0.23;
        const d2 = Math.hypot(nx - c2x, ny - c2y);
        const alpha2 = Math.max(0, Math.min(1, (r2 - d2) * size * scale));

        // Subtle outer ambient glow
        const glowTeal = Math.max(0, 1 - d1 / (r1 * 2.1)) * 0.22;
        const glowAmber = Math.max(0, 1 - d2 / (r2 * 2.1)) * 0.18;

        let curR = bgR + glowTeal * 79 + glowAmber * 242;
        let curG = bgG + glowTeal * 216 + glowAmber * 184;
        let curB = bgB + glowTeal * 196 + glowAmber * 75;

        // Sphere 1 (Teal) with subtle 3D highlight
        if (alpha1 > 0) {
          const normD = d1 / r1;
          const light = Math.max(0, 1 - Math.hypot(nx - (c1x - 0.05), ny - (c1y - 0.05)) / r1);
          const tR = 79 * (0.85 + light * 0.4);
          const tG = 216 * (0.85 + light * 0.35);
          const tB = 196 * (0.85 + light * 0.4);
          const a = alpha1 * 0.92;

          curR = curR * (1 - a) + tR * a;
          curG = curG * (1 - a) + tG * a;
          curB = curB * (1 - a) + tB * a;
        }

        // Sphere 2 (Amber) blended over
        if (alpha2 > 0) {
          const light = Math.max(0, 1 - Math.hypot(nx - (c2x - 0.05), ny - (c2y - 0.05)) / r2);
          const aR = 242 * (0.85 + light * 0.35);
          const aG = 184 * (0.85 + light * 0.35);
          const aB = 75 * (0.85 + light * 0.4);
          const a = alpha2 * 0.88;

          curR = curR * (1 - a) + aR * a;
          curG = curG * (1 - a) + aG * a;
          curB = curB * (1 - a) + aB * a;
        }

        // Border squircle for non-maskable / app icon look
        if (!isMaskable && size > 64) {
          // Subtle border ring
          const cornerDist = Math.max(Math.abs(x - 0.5), Math.abs(y - 0.5));
          if (cornerDist > 0.47) {
            curR *= 0.8;
            curG *= 0.8;
            curB *= 0.8;
          }
        }

        accR += curR;
        accG += curG;
        accB += curB;
        accA += 255;
      }
    }

    const count = samples * samples;
    return [accR / count, accG / count, accB / count, accA / count];
  });
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating SkillSphere PWA icons...');

// Generate 512x512
console.log('Rendering icon-512.png...');
const icon512 = renderIcon(512, false);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);

// Generate 192x192
console.log('Rendering icon-192.png...');
const icon192 = renderIcon(192, false);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);

// Generate maskable 512x512
console.log('Rendering icon-maskable-512.png...');
const iconMaskable512 = renderIcon(512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), iconMaskable512);

// Generate maskable 192x192
console.log('Rendering icon-maskable-192.png...');
const iconMaskable192 = renderIcon(192, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), iconMaskable192);

// Generate apple-touch-icon 180x180
console.log('Rendering apple-touch-icon.png...');
const appleIcon = renderIcon(180, false);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleIcon);

// Generate favicon 32x32
console.log('Rendering favicon-32.png...');
const fav32 = renderIcon(32, false);
fs.writeFileSync(path.join(iconsDir, 'favicon-32.png'), fav32);

// Also generate SVG favicon & icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0F1117"/>
  <defs>
    <filter id="glowTeal" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="24" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="glowAmber" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="24" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#72f1df"/>
      <stop offset="100%" stop-color="#38b7a6"/>
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd572"/>
      <stop offset="100%" stop-color="#e29b28"/>
    </linearGradient>
  </defs>
  <!-- Background Glows -->
  <circle cx="210" cy="256" r="140" fill="#4FD8C4" opacity="0.2" filter="url(#glowTeal)"/>
  <circle cx="302" cy="256" r="140" fill="#F2B84B" opacity="0.2" filter="url(#glowAmber)"/>
  <!-- Primary Overlapping Spheres -->
  <circle cx="210" cy="256" r="115" fill="url(#tealGrad)" opacity="0.94"/>
  <circle cx="302" cy="256" r="115" fill="url(#amberGrad)" opacity="0.86"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), svgContent);
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);

console.log('All icons generated successfully!');
