import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'extension');
const iconsDir = path.join(outDir, 'icons');

console.log('[build-extension] Target directory:', outDir);

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Generate standard valid PNG icons
function createPngBuffer(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2; // RGB
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crcVal = zlib.crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    rawRows.push(Buffer.from([0]));
    for (let x = 0; x < width; x++) {
      // Draw a stylish blue square with rounded borders/highlight
      const isEdge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      if (isEdge) {
        rawRows.push(Buffer.from([r - 30 > 0 ? r - 30 : 0, g - 30 > 0 ? g - 30 : 0, b]));
      } else {
        rawRows.push(Buffer.from([r, g, b]));
      }
    }
  }
  const idatData = zlib.deflateSync(Buffer.concat(rawRows));
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconSizes = [16, 32, 48, 128];
for (const size of iconSizes) {
  const iconPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(iconPath, createPngBuffer(size, size, 37, 99, 235)); // Primary brand blue #2563eb
}
console.log('[build-extension] Generated extension icons');

// 2. Write manifest.json
const manifest = {
  manifest_version: 3,
  name: "Meta Ad Library Lead Scraper",
  version: "1.0.0",
  description: "Local standalone Meta Ad Library scraper Chrome extension for public lead research.",
  permissions: [
    "storage",
    "tabs",
    "scripting",
    "sidePanel"
  ],
  host_permissions: [
    "https://www.facebook.com/ads/library/*",
    "https://web.facebook.com/ads/library/*"
  ],
  background: {
    service_worker: "service-worker.js",
    type: "module"
  },
  side_panel: {
    default_path: "sidepanel.html"
  },
  action: {
    default_title: "Open Lead Scraper",
    default_popup: "popup.html"
  },
  content_scripts: [
    {
      matches: [
        "https://www.facebook.com/ads/library/*",
        "https://web.facebook.com/ads/library/*"
      ],
      js: ["content-script.js"],
      run_at: "document_idle"
    }
  ],
  icons: {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('[build-extension] Written manifest.json');

// 3. Write HTML entrypoints (sidepanel.html and popup.html)
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meta Ad Library Lead Scraper</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      width: 440px;
      height: 600px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="app.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'sidepanel.html'), htmlTemplate);
fs.writeFileSync(path.join(outDir, 'popup.html'), htmlTemplate);
console.log('[build-extension] Written sidepanel.html and popup.html');

// 4. Bundle Service Worker (ESM)
await esbuild.build({
  entryPoints: [path.join(rootDir, 'src/extension/service-worker.ts')],
  outfile: path.join(outDir, 'service-worker.js'),
  bundle: true,
  format: 'esm',
  target: 'chrome120',
  platform: 'browser',
  sourcemap: true
});
console.log('[build-extension] Bundled service-worker.js');

// 5. Bundle Content Script (IIFE)
await esbuild.build({
  entryPoints: [path.join(rootDir, 'src/extension/content-script.ts')],
  outfile: path.join(outDir, 'content-script.js'),
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  platform: 'browser',
  sourcemap: true
});
console.log('[build-extension] Bundled content-script.js');

// 6. Bundle UI App (ESM)
await esbuild.build({
  entryPoints: [path.join(rootDir, 'src/extension/ui/index.tsx')],
  outfile: path.join(outDir, 'app.js'),
  bundle: true,
  format: 'esm',
  target: 'chrome120',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  sourcemap: true
});
console.log('[build-extension] Bundled app.js');

// 7. Write Tailwind / base CSS
const cssContent = `
/* Pre-rendered utility styling for Chrome Extension UI */
* { box-sizing: border-box; }
body { margin: 0; padding: 0; background: #0f172a; color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; }
button, input, select, textarea { font-family: inherit; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0f172a; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #475569; }
`;
fs.writeFileSync(path.join(outDir, 'styles.css'), cssContent);
console.log('[build-extension] Written styles.css');

console.log('[build-extension] Extension build completed successfully in ./extension');
