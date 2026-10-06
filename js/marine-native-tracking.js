/* Native foreground tracking bridge. The Android service stores GPS locally only; cloud sharing is handled by SupabaseSync in the active WebView and requires separate consent. */
(function () {
  "use strict";

  const Native = () => window.Capacitor?.Plugins?.MarineTracking || null;
  const key = "bs10_native_tracking_v1";
  const read = () => { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) { return {}; } };
  const save = (value) => localStorage.setItem(key, JSON.stringify(value));

  async function status() {
    const native = Native();
    if (!native) return { supported: false, running: false, message: "Tracking latar belakang hanya tersedia pada APK Android." };
    try { return { supported: true, ...await native.status() }; }
    catch (error) { return { supported: true, running: false, message: error?.message || "Status native gagal" }; }
  }

  async function start() {
    const native = Native();
    if (!native) {
      save({ ...read(), requested: true });
      return { ok: false, supported: false, message: "Jalankan APK Android untuk tracking latar belakang." };
    }
    const result = await native.start({ mode: "local-only" });
    if (result?.ok === false) throw new Error(result.message || "Tracking native gagal dimulai");
    save({ ...read(), running: true, startedAt: Date.now() });
    return result;
  }

  async function stop() {
    const native = Native();
    if (!native) return { ok: false, supported: false };
    const result = await native.stop();
    save({ ...read(), running: false, stoppedAt: Date.now() });
    return result;
  }

  function render(state) {
    const element = document.getElementById("nativeTrackingStatus");
    if (!element) return;
    if (!state.supported) {
      element.textContent = "📱 Tracking latar belakang hanya tersedia di APK Android. GPS cloud memerlukan izin berbagi terpisah.";
      return;
    }
    if (!state.running) {
      element.textContent = "⚪ Tracking latar belakang berhenti. GPS cloud dikendalikan oleh izin berbagi terpisah.";
      return;
    }
    const shareNote = localStorage.getItem("bs10_share_live_location") === "true"
      ? "🔐 Posisi cloud hanya saat aplikasi aktif dan izin berbagi menyala"
      : "🔒 Lokal saja • posisi tidak dibagikan";
    if (!state.updatedAt) {
      element.textContent = "🟠 Service lokal aktif, menunggu fix GNSS • " + shareNote;
      return;
    }
    const age = Math.max(0, Date.now() - state.updatedAt);
    const freshness = age < 15000 ? "🟢 GPS baru" : "🟠 GPS terakhir " + Math.round(age / 1000) + " dtk lalu";
    element.textContent = freshness + " • " + Number(state.lat).toFixed(5) + ", " + Number(state.lon).toFixed(5) + " • " + new Date(state.updatedAt).toLocaleTimeString("id-ID") + " • tersimpan lokal • " + shareNote;
  }

  async function poll() {
    const state = await status();
    render(state);
    if (state.updatedAt && typeof MapApp !== "undefined" && MapApp.lat === null) {
      MapApp.lat = state.lat;
      MapApp.lon = state.lon;
    }
  }

  window.MarineNativeTracking = { start, stop, status, poll };
  document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("btnStartNativeTracking");
    const stopButton = document.getElementById("btnStopNativeTracking");
    startButton?.addEventListener("click", async () => {
      try {
        const result = await start();
        if (result?.ok === false) throw new Error(result.message || "Tracking tidak aktif");
        alert("Tracking latar belakang diaktifkan untuk penyimpanan lokal. Berbagi ke kapal lain hanya berjalan saat aplikasi aktif dan izin GPS berbagi dinyalakan.");
      } catch (error) { alert(error?.message || "Tracking belum dapat diaktifkan. Periksa izin lokasi."); }
      poll();
    });
    stopButton?.addEventListener("click", async () => { await stop(); poll(); });
    poll();
    setInterval(poll, 5000);
  });
})();
