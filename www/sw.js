const CACHE = "berkah-samudera10-v4";
const SHELL = ["./", "./index.html", "./css/style.css", "./manifest.json",
  "./js/storage.js", "./js/map.js", "./js/live-sync.js", "./icon.svg", "./logo-berkahsamudera.svg", "./js/weather.js", "./js/tangkapan.js",
  "./js/kolekting.js", "./js/perbekalan.js", "./js/kru.js", "./js/auth.js", "./js/story.js", "./js/supabase-sync.js", "./js/notifications.js", "./js/prayer.js", "./js/quran.js", "./js/app.js",
  "./file_000000000fa48211b2c09fa64b21f357.png",
  "./490719828_1789293110615125.jpg"];

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

  // Cache peta (tile OSM) strategi cache-first
  if (url.includes("tile.openstreetmap.org")) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit ||
        fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        }).catch(() => hit))
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
