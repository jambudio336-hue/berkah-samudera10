const CACHE = "berkah-samudera-v11";
const SHELL = [
  "./", "./index.html", "./css/style.css", "./manifest.json",
  "./icon.svg", "./icon-192.png", "./icon-512.png", "./icon-foreground.svg",
  "./js/storage.js", "./js/map.js", "./js/map-provider-catalog.js", "./js/weather.js", "./js/tangkapan.js",
  "./js/kolekting.js", "./js/perbekalan.js", "./js/supabase-sync.js", "./js/device-profile.js",
  "./js/notifications.js", "./js/prayer.js", "./js/quran.js", "./js/app.js",
  "./js/marine-os.js", "./js/marine-command.js", "./js/marine-free.js", "./js/marine-external.js",
  "./js/marine-runtime.js", "./js/marine-welcome.js", "./js/safety-checklist.js",
  "./js/garmin-activecaptain.js", "./js/marine-capabilities.js", "./js/marine-native-tracking.js",
  "./js/marine-updater.js", "./js/marine-tools.js", "./js/jarvis-openrouter.js",
  "./css/marine-os.css", "./css/marine-runtime.css", "./css/marine-welcome.css", "./css/jarvis.css",
  "./assets/marine-splash.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (e.request.method !== "GET") return;

  // Video intro: cache-first (biar splash tetap jalan saat offline)
  if (url.includes("ssstik.io_")) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit ||
        fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        }))
    );
    return;
  }

  // API cuaca: network-first, fallback cache
  if (url.includes("open-meteo.com") || url.includes("bmkg")) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Tile/provider eksternal mengikuti kebijakan cache masing-masing; jangan
  // menyimpan tile peta publik secara permanen atau menyiapkan offline tiles.
  if (new URL(url).origin !== self.location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Aset aplikasi: cache-first
  e.respondWith(
    caches.match(e.request).then((hit) => hit ||
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      }))
  );
});
