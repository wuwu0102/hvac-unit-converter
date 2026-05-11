#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'dist-mobile');

const seen = new Set();
const parsedTextFiles = new Set();

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyFilePreserve(relativePath) {
  if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('//') || relativePath.startsWith('data:')) {
    return;
  }

  const normalized = relativePath.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '');
  if (!normalized || normalized.startsWith('..')) return;

  const srcPath = path.join(rootDir, normalized);
  if (!fs.existsSync(srcPath) || !fs.statSync(srcPath).isFile()) return;

  const outPath = path.join(outDir, normalized);
  ensureDir(outPath);
  fs.copyFileSync(srcPath, outPath);
  seen.add(normalized);
}

function collectFromText(text, currentRel = '') {
  const refs = new Set();
  const regexes = [
    /(?:src|href)=['"]([^'"]+)['"]/g,
    /(?:import\s+[^'";]+from\s*|import\s*\()\s*['"]([^'"]+)['"]/g,
    /@import\s+['"]([^'"]+)['"]/g,
    /url\(([^)]+)\)/g,
    /fetch\(\s*['"]([^'"]+)['"]/g
  ];

  for (const regex of regexes) {
    let match;
    while ((match = regex.exec(text))) {
      const raw = match[1].trim().replace(/^['\"]|['\"]$/g, '').split('#')[0].split('?')[0];
      if (!raw) continue;
      refs.add(raw);
    }
  }

  const results = [];
  for (const ref of refs) {
    if (ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('tel:') || ref.startsWith('javascript:')) continue;
    if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('//') || ref.startsWith('data:')) continue;

    const base = currentRel ? path.posix.dirname(currentRel) : '';
    const normalized = ref.startsWith('/')
      ? ref.slice(1)
      : path.posix.normalize(path.posix.join(base, ref));

    if (!normalized.startsWith('..')) {
      results.push(normalized);
    }
  }

  return results;
}

function processTextFile(relPath) {
  if (parsedTextFiles.has(relPath)) return;
  copyFilePreserve(relPath);
  parsedTextFiles.add(relPath);
  const absPath = path.join(rootDir, relPath);
  if (!fs.existsSync(absPath)) return;

  const ext = path.extname(relPath).toLowerCase();
  if (!['.html', '.js', '.css', '.json', '.mjs'].includes(ext)) return;

  const content = fs.readFileSync(absPath, 'utf8');
  const refs = collectFromText(content, relPath);
  for (const ref of refs) {
    const refExt = path.extname(ref).toLowerCase();
    if (['.html', '.js', '.css', '.json', '.mjs', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.otf'].includes(refExt)) {
      const absRef = path.join(rootDir, ref);
      if (fs.existsSync(absRef) && fs.statSync(absRef).isFile()) {
        if (['.html', '.js', '.css', '.json', '.mjs'].includes(refExt)) {
          processTextFile(ref);
        } else {
          copyFilePreserve(ref);
        }
      }
    }
  }
}

function rewriteAbsolutePathsInIndex() {
  const indexPath = path.join(outDir, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(/\b(src|href)=(["'])\/(?!\/)([^"']+)\2/g, '$1=$2./$3$2');
  fs.writeFileSync(indexPath, html, 'utf8');
}

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

copyFilePreserve('index.html');
copyFilePreserve('app.js');

for (const file of fs.readdirSync(rootDir)) {
  if (/\.css$/i.test(file) && fs.statSync(path.join(rootDir, file)).isFile()) {
    copyFilePreserve(file);
  }
}

for (const candidate of ['manifest.json', 'site.webmanifest', 'favicon.ico', 'favicon.png']) {
  copyFilePreserve(candidate);
}

processTextFile('index.html');
processTextFile('app.js');

rewriteAbsolutePathsInIndex();

console.log('Prepared dist-mobile for Capacitor.');
