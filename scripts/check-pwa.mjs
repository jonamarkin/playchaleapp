import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'public/sw.js',
  'public/offline.html',
  'public/manifest.json',
  'public/icons/icon-192x192.png',
  'public/icons/icon-512x512.png',
];

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missingFiles.length > 0) {
  console.error('Missing PWA files:');
  for (const file of missingFiles) console.error(`- ${file}`);
  process.exit(1);
}

const manifestPath = path.join(root, 'public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestIconIssues = (manifest.icons || [])
  .map((icon) => icon.src)
  .filter((src) => !fs.existsSync(path.join(root, 'public', src.replace(/^\//, ''))));

if (manifestIconIssues.length > 0) {
  console.error('Manifest references missing icons:');
  for (const src of manifestIconIssues) console.error(`- ${src}`);
  process.exit(1);
}

const swText = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
const requiredSnippets = [
  "caches.open(STATIC_CACHE)",
  "request.mode === 'navigate'",
  "caches.match('/offline.html')",
  "url.pathname.startsWith('/api/')",
];

const missingSnippets = requiredSnippets.filter((snippet) => !swText.includes(snippet));

if (missingSnippets.length > 0) {
  console.error('Service worker is missing expected offline/cache behavior:');
  for (const snippet of missingSnippets) console.error(`- ${snippet}`);
  process.exit(1);
}

console.log('PWA files look good.');
