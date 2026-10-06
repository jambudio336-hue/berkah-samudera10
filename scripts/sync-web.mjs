#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webDir = path.join(root, 'www');
fs.mkdirSync(webDir, { recursive: true });

for (const file of ['index.html', 'manifest.json', 'sw.js', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-foreground.svg', 'icon-berkahsamudera.png']) {
  const source = path.join(root, file);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(webDir, file));
}

for (const directory of ['css', 'js', 'assets']) {
  const source = path.join(root, directory);
  if (fs.existsSync(source)) fs.cpSync(source, path.join(webDir, directory), { recursive: true, force: true });
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
  const reference = match[1];
  if (!reference || /^(?:https?:|data:|mailto:|tel:|#|javascript:)/i.test(reference)) continue;
  const relative = decodeURIComponent(reference.split(/[?#]/, 1)[0]).replace(/^\.\//, '').replace(/^\/+/, '');
  const source = path.join(root, relative);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) continue;
  const destination = path.join(webDir, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

// These legacy entry points were intentionally removed from the login/story/crew UI.
for (const file of ['auth.js', 'story.js', 'kru.js']) {
  fs.rmSync(path.join(webDir, 'js', file), { force: true });
}

console.log('Web sources synchronized into www/ for Capacitor.');
