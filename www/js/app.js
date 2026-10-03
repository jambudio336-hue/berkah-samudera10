const App = {
  init() {
    App.initSplash();
    App.jamRealtime();
    setInterval(App.jamRealtime, 1000);
    App.tabs();
    App.kompas();
    App.onlineStatus();
    App.quoteDashboard();
    App.settings();
    if (typeof NotificationCenter !== "undefined") NotificationCenter.init();
    App.quickActions();
    App.dashboardStats();
    setInterval(App.dashboardStats, 5000);
    window.addEventListener("resize", () => { if (typeof MapApp !== "undefined" && MapApp.map) setTimeout(() => MapApp.map.invalidateSize(), 180); });
    document.getElementById("btnHapusSemua").addEventListener("click", () => {
      if (confirm("Yakin hapus SEMUA data? Ini tidak bisa dibatalkan!")) {
        Store.clearAll();
        renderSemuaList();
        Kru.render();
        alert("Semua data terhapus.");
      }
    });
  },

  initSplash() {
    const splash = document.getElementById("splash");
    const video = document.getElementById("splashVideo");
    const tap = document.getElementById("splashTap");

    const mulai = () => {
      splash.classList.add("playing");
      video.play().catch(() => {});
    };

    video.addEventListener("ended", () => {
      splash.style.transition = "opacity .6s";
      splash.style.opacity = "0";
      setTimeout(() => splash.remove(), 650);
    });

    // Coba autoplay penuh dengan suara
    video.play().then(() => {
      splash.classList.add("playing");
    }).catch(() => {
      // Browser blokir autoplay bersuara → minta ketuk dulu
      tap.addEventListener("click", mulai);
      video.addEventListener("click", mulai);
    });
  },

  jamRealtime() {
    const d = new Date();
    document.getElementById("jam").textContent = d.toLocaleTimeString("id-ID", { hour12: false });
    const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli",
      "Agustus","September","Oktober","November","Desember"];
    document.getElementById("tanggal").textContent =
      hari[d.getDay()] + ", " + d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  },

  tabs() {
    document.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("page-" + btn.dataset.page).classList.add("active");
        if (btn.dataset.page === "peta" && MapApp.map) {
          setTimeout(() => MapApp.map.invalidateSize(), 100);
        }
      });
    });
  },

  setHeading(deg, source) {
    const value = ((Number(deg) % 360) + 360) % 360;
    const heading = Math.round(value);
    const dial = document.getElementById("compassDial");
    const needle = document.getElementById("compassNeedle");
    if (dial) dial.style.transform = "rotate(" + (-value) + "deg)";
    if (needle) needle.style.transform = "rotate(" + value + "deg)";
    document.getElementById("dashHeading").textContent = heading + "°";
    const dirs = ["Utara", "Utara Timur Laut", "Timur Laut", "Timur Timur Laut", "Timur", "Timur Tenggara", "Tenggara", "Selatan Tenggara", "Selatan", "Selatan Barat Daya", "Barat Daya", "Barat Barat Daya", "Barat", "Barat Barat Laut", "Barat Laut", "Utara Barat Laut"];
    const direction = dirs[Math.round(value / 22.5) % 16];
    const label = document.getElementById("compassDirection"); if (label) label.textContent = direction;
    document.getElementById("compassStatus").textContent = direction + " • " + heading + "° • sumber " + source;
  },
  kompas() {
    const handler = (e) => {
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) App.setHeading(e.webkitCompassHeading, "sensor magnetometer");
      else if (e.absolute && e.alpha !== null) App.setHeading(360 - e.alpha, "sensor absolut");
      else if (e.alpha !== null) App.setHeading(360 - e.alpha, "sensor relatif");
    };
    const aktifkan = () => {
      if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().then((res) => { if (res === "granted") { window.addEventListener("deviceorientationabsolute", handler, true); document.getElementById("compassStatus").textContent = "Sensor kompas aktif"; } }).catch(() => {});
      } else if (window.DeviceOrientationEvent) { window.addEventListener("deviceorientationabsolute", handler, true); document.getElementById("compassStatus").textContent = "Sensor kompas aktif"; }
    };
    document.getElementById("compassButton").addEventListener("click", aktifkan);
    const btn = document.getElementById("btnRequestCompass"); if (btn) btn.addEventListener("click", aktifkan);
    aktifkan();
  },
  onlineStatus() {
    const el = document.getElementById("statusNet");
    const update = () => {
      el.textContent = navigator.onLine ? "🟢 Online" : "🔴 Offline — mode darurat";
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
  },

  quickActions() {
    document.querySelectorAll("[data-go]").forEach((btn) => btn.addEventListener("click", () => {
      const target = document.querySelector('.tab[data-page="' + btn.dataset.go + '"]'); if (target) target.click();
    }));
  },
  settings() {
    const name = document.getElementById("settingVesselName"), id = document.getElementById("settingVesselId"), api = document.getElementById("settingApi");
    if (!name) return;
    name.value = localStorage.getItem("bs10_vessel_name") || "Berkah Samudera 10"; id.value = localStorage.getItem("bs10_vessel_id") || "kapal-utama"; api.value = localStorage.getItem("bs10_api") || "";
    document.getElementById("settingAutoCenter").checked = localStorage.getItem("bs10_auto_center") !== "false";
    document.getElementById("settingShowTrack").checked = localStorage.getItem("bs10_show_track") !== "false";
    document.getElementById("btnSaveSettings").addEventListener("click", () => { localStorage.setItem("bs10_vessel_name", name.value.trim() || "Berkah Samudera 10"); localStorage.setItem("bs10_vessel_id", id.value.trim() || "kapal-utama"); localStorage.setItem("bs10_api", api.value.trim()); localStorage.setItem("bs10_auto_center", document.getElementById("settingAutoCenter").checked); localStorage.setItem("bs10_show_track", document.getElementById("settingShowTrack").checked); if (typeof LiveSync !== "undefined") { LiveSync.base = api.value.trim(); LiveSync.connect(); } alert("✅ Pengaturan tersimpan."); });
    document.getElementById("btnTestApi").addEventListener("click", async () => { const out = document.getElementById("settingApiStatus"); if (!api.value.trim()) { out.textContent = "Isi URL backend dulu"; return; } out.textContent = "Menguji..."; try { const r = await fetch(api.value.replace(/\/$/, "") + "/health"); out.textContent = r.ok ? "✅ Online" : "❌ Respons gagal"; } catch (_) { out.textContent = "❌ Tidak tersambung"; } });
    document.getElementById("btnClearTrack").addEventListener("click", () => { if (confirm("Bersihkan jalur perjalanan di peta?")) MapApp.clearTrack(); });
    document.getElementById("btnRefreshData").addEventListener("click", () => { const pos = MapApp.lat !== null ? { lat: MapApp.lat, lon: MapApp.lon } : Weather.pos(); Weather.refreshPosition(pos.lat, pos.lon); alert("🔄 Data cuaca sedang disegarkan."); });
    document.getElementById("btnRequestGps").addEventListener("click", () => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(() => alert("✅ Akses lokasi aktif."), () => alert("❌ Akses lokasi ditolak atau belum tersedia."), { enableHighAccuracy: true }); });
  },
  dashboardStats() {
    const gps = document.getElementById("kpiGps");
    const sub = document.getElementById("kpiGpsSub");
    if (gps && typeof MapApp !== "undefined" ) { const active = MapApp.lat !== null; gps.textContent = active ? "AKTIF" : "MENUNGGU"; sub.textContent = active ? (document.getElementById("dashAcc").textContent.replace("Akurasi GNSS: ", "")) : "Nyalakan lokasi"; }
    const track = document.getElementById("kpiTrack"); if (track && typeof MapApp !== "undefined" && MapApp.track) track.textContent = MapApp.track.getLatLngs().length + " titik";
    const records = document.getElementById("kpiRecords"); if (records) records.textContent = ["tangkapan", "kolekting", "bbm", "logistik", "kru"].reduce((n, k) => n + Store.load(k).length, 0);
    const sync = document.getElementById("kpiSync"); const syncSub = document.getElementById("kpiSyncSub"); if (sync) { sync.textContent = navigator.onLine ? "ONLINE" : "OFFLINE"; syncSub.textContent = navigator.onLine ? "data siap sinkron" : "mode aman lokal"; }
  },
  quoteDashboard() {
    const el = document.getElementById("dashQuote");
    let i = Math.floor(Math.random() * QUOTES.length);
    const tampil = () => { el.textContent = '"' + QUOTES[i % QUOTES.length] + '"'; i++; };
    tampil();
    setInterval(tampil, 10000);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
  MapApp.init();
  Weather.init();
  Tangkapan.init();
  Kolekting.init();
  Perbekalan.init();
  Kru.init();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
});
