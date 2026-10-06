(() => {
  const plugin = () => window.Capacitor?.Plugins?.MarineUpdater;
  const state = { latest: null };

  function status(text) {
    const el = document.getElementById('marineUpdateStatus');
    if (el) el.textContent = text;
  }

  async function check(silent = true) {
    const p = plugin();
    if (!p?.check) {
      status('Update Play Store aktif bila aplikasi dipasang dari Google Play.');
      return null;
    }
    try {
      const r = await p.check();
      state.latest = r;
      const b = document.getElementById('btnMarineUpdate');
      if (r.available) {
        status(\`Update tersedia: v\${r.versionName}. Siap diunduh.\`);
        if (b) b.hidden = false;
      } else if (!silent) {
        status('Sudah versi terbaru.');
        if (b) b.hidden = true;
      }
      return r;
    } catch (e) {
      if (!silent) status('Belum bisa mengecek update. Coba lagi saat online.');
      return null;
    }
  }

  async function install() {
    const p = plugin();
    const r = state.latest || await check(false);
    if (!p?.installLatest || !r?.available) return;
    status('Mengunduh APK update...');
    try {
      await p.installLatest({ url: r.url });
      status('Installer Android dibuka. Ikuti konfirmasi sistem untuk menyelesaikan update.');
    } catch (e) {
      status(e?.message || 'Update belum dapat dipasang.');
    }
  }

  window.MarineUpdater = { check, install };
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnMarineUpdate')?.addEventListener('click', install);
    check(true);
    setInterval(() => check(true), 6 * 60 * 60 * 1000);
  });
})();
