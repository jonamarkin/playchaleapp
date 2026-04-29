import fs from 'fs';
import path from 'path';
import vm from 'vm';
import zlib from 'zlib';

const projectRoot = process.cwd();
const nextRoot = path.join(projectRoot, '.next');
const staticRoot = path.join(nextRoot, 'static');
const serverAppRoot = path.join(nextRoot, 'server', 'app');
const buildManifestPath = path.join(nextRoot, 'build-manifest.json');
const routeManifestPath = path.join(nextRoot, 'app-path-routes-manifest.json');

const formatSize = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

function assertBuildExists() {
  if (!fs.existsSync(buildManifestPath) || !fs.existsSync(serverAppRoot)) {
    throw new Error('No production build found. Run `pnpm build` before `pnpm perf:audit`.');
  }
}

function walk(dir, predicate, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, files);
    } else if (predicate(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function gzipSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  return {
    raw: buffer.length,
    gzip: zlib.gzipSync(buffer).length,
  };
}

function loadClientManifest(filePath) {
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(filePath, 'utf8'), context);

  const manifests = context.globalThis.__RSC_MANIFEST || {};
  const [entryKey] = Object.keys(manifests);
  return { entryKey, manifest: manifests[entryKey] };
}

function normalizeChunk(chunkPath) {
  return chunkPath.replace(/^\/_next\//, '');
}

function getRouteChunks(manifest, baseFiles) {
  const chunks = new Set(baseFiles);

  for (const moduleInfo of Object.values(manifest.clientModules || {})) {
    for (const chunk of moduleInfo.chunks || []) {
      chunks.add(normalizeChunk(chunk));
    }
  }

  for (const entryFiles of Object.values(manifest.entryJSFiles || {})) {
    for (const chunk of entryFiles || []) {
      chunks.add(normalizeChunk(chunk));
    }
  }

  for (const cssFiles of Object.values(manifest.entryCSSFiles || {})) {
    for (const css of cssFiles || []) {
      if (css.path) chunks.add(normalizeChunk(css.path));
    }
  }

  return chunks;
}

function summarizeRouteChunks() {
  const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
  const routes = fs.existsSync(routeManifestPath)
    ? JSON.parse(fs.readFileSync(routeManifestPath, 'utf8'))
    : {};
  const baseFiles = [
    ...(buildManifest.polyfillFiles || []),
    ...(buildManifest.rootMainFiles || []),
  ];
  const baseSet = new Set(baseFiles);

  const clientManifests = walk(
    serverAppRoot,
    (filePath) => filePath.endsWith('page_client-reference-manifest.js'),
  );

  return clientManifests
    .map((filePath) => {
      const { entryKey, manifest } = loadClientManifest(filePath);
      const chunks = getRouteChunks(manifest, baseFiles);
      let raw = 0;
      let gzip = 0;
      let nonBaseRaw = 0;
      let nonBaseGzip = 0;

      for (const chunk of chunks) {
        const chunkFile = path.join(nextRoot, chunk);
        if (!fs.existsSync(chunkFile)) continue;

        const size = gzipSize(chunkFile);
        raw += size.raw;
        gzip += size.gzip;

        if (!baseSet.has(chunk)) {
          nonBaseRaw += size.raw;
          nonBaseGzip += size.gzip;
        }
      }

      return {
        route: routes[entryKey] || entryKey,
        chunks: chunks.size,
        raw,
        gzip,
        nonBaseRaw,
        nonBaseGzip,
      };
    })
    .sort((a, b) => b.gzip - a.gzip);
}

function summarizeLargestChunks() {
  return fs
    .readdirSync(path.join(staticRoot, 'chunks'))
    .filter((file) => file.endsWith('.js') || file.endsWith('.css'))
    .map((file) => {
      const size = gzipSize(path.join(staticRoot, 'chunks', file));
      return { file, ...size };
    })
    .sort((a, b) => b.raw - a.raw)
    .slice(0, 15);
}

assertBuildExists();

console.log('\nRoute client payload estimates');
console.table(
  summarizeRouteChunks().map((row) => ({
    route: row.route,
    chunks: row.chunks,
    totalRaw: formatSize(row.raw),
    totalGzip: formatSize(row.gzip),
    routeRaw: formatSize(row.nonBaseRaw),
    routeGzip: formatSize(row.nonBaseGzip),
  })),
);

console.log('\nLargest static chunks');
console.table(
  summarizeLargestChunks().map((row) => ({
    file: row.file,
    raw: formatSize(row.raw),
    gzip: formatSize(row.gzip),
  })),
);
