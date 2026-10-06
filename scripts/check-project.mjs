#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const jsFiles = fs.readdirSync(path.join(root, 'js')).filter((name) => name.endsWith('.js')).map((name) => path.join(root, 'js', name));
let checks = 0;

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  assert.equal(result.status, 0, `JavaScript syntax failed: ${path.relative(root, file)}\n${result.stderr}`);
  checks += 1;
}

const html = read('index.html');
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual(duplicateIds, [], `Duplicate HTML id(s): ${[...new Set(duplicateIds)].join(', ')}`);
checks += 1;

for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
  const asset = match[1];
  if (!asset || /^(?:https?:|data:|mailto:|tel:|#|javascript:)/i.test(asset)) continue;
  const cleanPath = decodeURIComponent(asset.split(/[?#]/, 1)[0]);
  const relative = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath.replace(/^\.\//, '');
  assert.ok(fs.existsSync(path.join(root, relative)), `Missing local HTML asset: ${asset}`);
  checks += 1;
}

const sw = read('sw.js');
const shellMatch = sw.match(/const\s+SHELL\s*=\s*\[([\s\S]*?)\]\s*;/);
assert.ok(shellMatch, 'Service worker SHELL asset list not found');
const shellAssets = [...shellMatch[1].matchAll(/["'](\.?\/?[^"']+)["']/g)].map((match) => match[1]);
for (const asset of shellAssets) {
  const relative = asset.replace(/^\.\//, '');
  assert.ok(fs.existsSync(path.join(root, relative)), `Missing service worker precache asset: ${asset}`);
  checks += 1;
}

const deprecated = /page-(?:akun|story|kru)|(?:auth|story|kru)\.js|SupabaseAuth|StoryApp|\bKru\./i;
assert.ok(!deprecated.test(html), 'Removed login/story/crew UI still referenced by index.html');
assert.ok(fs.existsSync(path.join(root, 'js/device-profile.js')), 'Device profile module missing');
assert.ok(fs.existsSync(path.join(root, 'js/safety-checklist.js')), 'Safety checklist module missing');
assert.ok(html.includes('id="map3d"') && html.includes('id="btn3D"'), 'MapLibre 3D interface missing');
checks += 4;

const catalog = read('js/map-provider-catalog.js');
assert.equal((catalog.match(/\{ name: "/g) || []).length, 25, 'Map provider catalog must contain exactly 25 audited entries');
assert.ok(html.includes('id="mapProviderDialog"') && html.includes('id="btnMapSources"') && html.includes('id="map3dStyle"'), 'Provider catalog or 3D style selector missing');
assert.ok(!/basemaps\.cartocdn\.com|services\.arcgisonline\.com|tile\.openstreetmap\.fr/.test(read('js/map.js')), 'Unapproved legacy map endpoint still installed');
assert.ok(sw.includes('new URL(url).origin !== self.location.origin'), 'External provider tiles must bypass service-worker cache');
assert.ok(!read('js/marine-external.js').includes('carto:'), 'Unapproved CARTO endpoint still advertised at runtime');
const mainActivity = read('android/app/src/main/java/com/m4zk1pl4y/berkahsamudera10/MainActivity.java');
assert.ok(mainActivity.includes('BerkahSamudera10/'), 'Android WebView must identify the app to public tile providers');
assert.ok(mainActivity.includes('getPackageManager().getPackageInfo') && !mainActivity.includes('BuildConfig'), 'WebView User-Agent version must not depend on disabled BuildConfig generation');
const marineOS = read('js/marine-os.js');
assert.ok(!marineOS.includes('this.go("akun")'), 'Removed account tab is still a module destination');
const moduleTargets = [...marineOS.matchAll(/\["[^"]+","[^"]+","[^"]+","[^"]+","([^"]+)",(?:true|false)\]/g)].map((match) => match[1]);
assert.ok(moduleTargets.length > 0 && moduleTargets.every((target) => html.includes(`data-page="${target}"`)), 'A Marine OS module links to a missing page/tab');
assert.ok(marineOS.includes('version: "1.1.0"'), 'Marine OS metadata version is out of sync');
checks += 10;

const syncSource = read('js/supabase-sync.js');
const nativeBridge = read('js/marine-native-tracking.js');
const nativeService = read('android/app/src/main/java/com/m4zk1pl4y/berkahsamudera10/MarineTrackingService.java');
const deviceProfile = read('js/device-profile.js');
const ownerWriteMigration = read('supabase/migrations/20261006204600_anonymous_profile_owner_writes.sql');
const ciWorkflow = read('.github/workflows/marine-os-ci.yml');
const releaseWorkflow = read('.github/workflows/marine-release.yml');
assert.ok(syncSource.includes('if (!this.sharingEnabled() || !navigator.onLine) return;'), 'WebView GPS publishing must require explicit sharing consent');
assert.ok(!nativeService.includes('live_positions') && !nativeService.includes('Authorization') && !nativeService.includes('supabase.co/rest'), 'Native background service must never publish GPS or carry Supabase credentials');
assert.ok(!nativeBridge.includes('accessToken') && nativeBridge.includes('local-only'), 'Native bridge must be local-only and must not pass auth tokens');
assert.ok(deviceProfile.includes('Saat aktif dan aplikasi berjalan') && deviceProfile.includes('tidak mengirimnya ke cloud'), 'Location consent must explain foreground-only cloud sharing');
assert.ok(ownerWriteMigration.includes('FOR INSERT TO authenticated') && ownerWriteMigration.includes('FOR UPDATE TO authenticated') && ownerWriteMigration.includes('id = auth.uid()'), 'Owner-only profile write RLS migration missing');
assert.ok(ciWorkflow.includes('feature/**') && ciWorkflow.includes('git ls-files --error-unmatch') && ciWorkflow.includes('unzip -Z1'), 'CI must test feature branches and verify source archive contents');
assert.ok(releaseWorkflow.includes('workflow_dispatch:') && /push:\n    tags:\n      - "v\*"/.test(releaseWorkflow) && !/^\s*branches:/m.test(releaseWorkflow) && releaseWorkflow.includes('PACKAGE_VERSION=') && releaseWorkflow.includes('--target "$GITHUB_SHA"'), 'Release workflow must run manually or only on version tags and point at the tested commit');
assert.ok(releaseWorkflow.includes('run: |\n          "$ANDROID_HOME/build-tools/35.0.0/apksigner" verify --verbose'), 'APK signature verification command must be a valid YAML block scalar');
checks += 8;

const config = JSON.parse(read('capacitor.config.json'));
assert.equal(config.webDir, 'www', 'Capacitor must build the checked-in www webDir');
checks += 1;

const packageMeta = JSON.parse(read('package.json'));
const lockMeta = JSON.parse(read('package-lock.json'));
const androidGradle = read('android/app/build.gradle');
const releaseScript = read('build-release.sh');
assert.equal(packageMeta.version, '1.1.0', 'Unexpected project release version');
assert.equal(lockMeta.version, packageMeta.version, 'package-lock version does not match package.json');
assert.ok(androidGradle.includes(': 10100)') && androidGradle.includes('"1.1.0"'), 'Android fallback version is out of sync');
assert.ok(releaseScript.includes('VERSION_NAME:=1.1.0') && releaseScript.includes('VERSION_CODE:=10100'), 'Release script version is out of sync');
assert.ok(html.includes('Versi aplikasi 1.1.0'), 'About screen version is out of sync');
assert.ok(read('js/jarvis-openrouter.js').includes('version: "1.1.0"'), 'Kiplay context version is out of sync');
checks += 6;

const mirroredFiles = ['index.html', 'manifest.json', 'sw.js', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-foreground.svg', 'icon-berkahsamudera.png'];
for (const directory of ['css', 'js', 'assets']) {
  const walk = (base, relative = '') => fs.readdirSync(path.join(base, relative), { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(relative, entry.name);
    return entry.isDirectory() ? walk(base, child) : [path.join(path.basename(base), child)];
  });
  mirroredFiles.push(...walk(path.join(root, directory)));
}
for (const file of mirroredFiles) {
  const rootFile = path.join(root, file);
  const webFile = path.join(root, 'www', file);
  assert.ok(fs.existsSync(webFile), `Capacitor webDir asset missing: ${file}`);
  assert.ok(fs.readFileSync(rootFile).equals(fs.readFileSync(webFile)), `Root/www mismatch: ${file}`);
  checks += 1;
}
for (const file of ['auth.js', 'story.js', 'kru.js']) {
  assert.ok(!fs.existsSync(path.join(root, 'www', 'js', file)), `Retired module still present in APK webDir: ${file}`);
  checks += 1;
}

console.log(`Project checks passed: ${checks} assertions, ${jsFiles.length} JavaScript files syntax-checked.`);
