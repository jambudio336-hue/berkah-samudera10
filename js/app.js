const App = {
  init() {
    App.jamRealtime();
    setInterval(App.jamRealtime, 1000);
    App.tabs();
    App.kompas();
    App.onlineStatus();
    App.quoteDashboard();
    document.getElementById("btnHapusSemua").addEventListener("click", () => {
      if (confirm("Yakin hapus SEMUA data? Ini tidak bisa dibatalkan!")) {
        Store.clearAll();
        renderSemuaList();
        Kru.render();
        alert("Semua data terhapus.");
      }
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
      // iOS perlu izin sekali klik
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
