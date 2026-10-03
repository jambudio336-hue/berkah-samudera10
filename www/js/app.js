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
    App.quickActions();
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

  kompas() {
    const tampil = (deg) => {
      document.getElementById("dashHeading").textContent = Math.round(deg) + "°";
      document.getElementById("compassNeedle").style.transform =
        "rotate(" + deg + "deg)";
    };
    const handler = (e) => {
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        tampil(e.webkitCompassHeading);
      } else if (e.alpha !== null) {
        tampil(360 - e.alpha);
      }
    };
    if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
      document.getElementById("compassNeedle").addEventListener("click", () => {
        DeviceOrientationEvent.requestPermission().then((res) => {
          if (res === "granted") window.addEventListener("deviceorientationabsolute", handler, true);
        });
      });
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientationabsolute", handler, true);
    }
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
    document.getElementById("btnSaveSettings").addEventListener("click", () => { localStorage.setItem("bs10_vessel_name", name.value.trim() || "Berkah Samudera 10"); localStorage.setItem("bs10_vessel_id", id.value.trim() || "kapal-utama"); localStorage.setItem("bs10_api", api.value.trim()); localStorage.setItem("bs10_auto_center", document.getElementById("settingAutoCenter").checked); localStorage.setItem("bs10_show_track", document.getElementById("settingShowTrack").checked); if (window.LiveSync) { LiveSync.base = api.value.trim(); LiveSync.connect(); } alert("✅ Pengaturan tersimpan."); });
    document.getElementById("btnTestApi").addEventListener("click", async () => { const out = document.getElementById("settingApiStatus"); if (!api.value.trim()) { out.textContent = "Isi URL backend dulu"; return; } out.textContent = "Menguji..."; try { const r = await fetch(api.value.replace(/\/$/, "") + "/health"); out.textContent = r.ok ? "✅ Online" : "❌ Respons gagal"; } catch (_) { out.textContent = "❌ Tidak tersambung"; } });
    document.getElementById("btnClearTrack").addEventListener("click", () => { if (confirm("Bersihkan jalur perjalanan di peta?")) MapApp.clearTrack(); });
    document.getElementById("btnRefreshData").addEventListener("click", () => { const pos = MapApp.lat !== null ? { lat: MapApp.lat, lon: MapApp.lon } : Weather.pos(); Weather.refreshPosition(pos.lat, pos.lon); alert("🔄 Data cuaca sedang disegarkan."); });
    document.getElementById("btnRequestGps").addEventListener("click", () => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(() => alert("✅ Akses lokasi aktif."), () => alert("❌ Akses lokasi ditolak atau belum tersedia."), { enableHighAccuracy: true }); });
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
