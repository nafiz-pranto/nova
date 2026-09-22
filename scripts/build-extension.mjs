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
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    rawRows.push(Buffer.from([0]));
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep Charcoal background (#0F172A)
      let r = 15, g = 23, b = 42;

      // Outer orbit circle
      if (Math.abs(dist - radius) <= Math.max(1, width * 0.04)) {
        r = 51; g = 65; b = 85; // #334155
      }

      const nx = x / width;
      const ny = y / height;

      // Abstract "N" geometric signal flow
      const strokeW = Math.max(1.5, width * 0.1);
      const isLeftCol = Math.abs(x - width * 0.32) <= strokeW / 2 && ny >= 0.24 && ny <= 0.76;
      const isRightCol = Math.abs(x - width * 0.68) <= strokeW / 2 && ny >= 0.24 && ny <= 0.76;

      const x1 = width * 0.32, y1 = height * 0.26;
      const x2 = width * 0.68, y2 = height * 0.74;
      const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
      let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / l2;
      t = Math.max(0, Math.min(1, t));
      const px = x1 + t * (x2 - x1);
      const py = y1 + t * (y2 - y1);
      const distToDiag = Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
      const isDiag = distToDiag <= strokeW / 2;

      if (isLeftCol || isRightCol || isDiag) {
        // Muted Purple brand gradient (#7C3AED to #A78BFA)
        const prog = (nx + ny) / 2;
        r = Math.min(248, Math.round(124 + prog * 100));
        g = Math.min(250, Math.round(58 + prog * 140));
        b = Math.min(255, Math.round(237 + prog * 18));
      }

      rawRows.push(Buffer.from([r, g, b]));
    }
  }
  const idatData = zlib.deflateSync(Buffer.concat(rawRows));
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconSizes = [16, 32, 48, 128, 256];
for (const size of iconSizes) {
  const iconPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(iconPath, createPngBuffer(size, size));
}
console.log('[build-extension] Generated extension icons');

// 2. Write manifest.json
const manifest = {
  manifest_version: 3,
  name: "LeadNoria",
  short_name: "LeadNoria",
  version: "1.0.0",
  description: "A browser-based business lead research extension.",
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
    default_title: "Open LeadNoria",
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
  <title>LeadNoria</title>
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
let compiledTailwind = '';
const distAssetsDir = path.join(rootDir, 'dist/assets');
if (fs.existsSync(distAssetsDir)) {
  const cssFiles = fs.readdirSync(distAssetsDir).filter(f => f.endsWith('.css'));
  if (cssFiles.length > 0) {
    compiledTailwind = fs.readFileSync(path.join(distAssetsDir, cssFiles[0]), 'utf-8');
    console.log(`[build-extension] Injected compiled Tailwind CSS (${Math.round(compiledTailwind.length / 1024)} KB) from ${cssFiles[0]}`);
  }
}

const cssContent = `
${compiledTailwind}

/* Extension-specific UI resets */
* { box-sizing: border-box; }
body { margin: 0; padding: 0; background: #0f172a; color: #f8fafc; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
button, input, select, textarea { font-family: inherit; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0f172a; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #475569; }
`;
fs.writeFileSync(path.join(outDir, 'styles.css'), cssContent);
console.log('[build-extension] Written styles.css');

// 8. Package distribution ZIPs for GitHub Releases
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');

function createZipArchive(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    const parentDir = path.dirname(zipPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const output = fs.createWriteStream(zipPath);
    const archive = new archiver.ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`[build-extension] Packaged release ZIP: ${zipPath} (${(archive.pointer() / 1024).toFixed(1)} KB)`);
      resolve();
    });

    archive.on('error', (err) => reject(err));
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

const releaseZipPath1 = path.join(rootDir, 'extension.zip');
const releaseZipPath2 = path.join(rootDir, 'dist/meta-ad-library-lead-scraper-v1.0.0.zip');
const releaseZipPath3 = path.join(rootDir, 'dist/leadnoria-v1.0.0.zip');

await createZipArchive(outDir, releaseZipPath1);
await createZipArchive(outDir, releaseZipPath2);
await createZipArchive(outDir, releaseZipPath3);

console.log('[build-extension] Extension build completed successfully in ./extension');
console.log('[build-extension] Release distribution packages ready in ./extension.zip, ./dist/leadnoria-v1.0.0.zip, and ./dist/meta-ad-library-lead-scraper-v1.0.0.zip');
