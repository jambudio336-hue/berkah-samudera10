const NotificationCenter = {
  key: "bs10_notifications",
  hashKey: "bs10_notification_hashes",
  sources: [
    { id: "bmkg-maritim", title: "BMKG Maritim", url: "https://maritim.bmkg.go.id/cuaca/peringatan/gelombang", type: "page" },
    { id: "bmkg-gempa", title: "Gempa BMKG", url: "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", type: "earthquake" }
  ],
  init() {
    const enable = document.getElementById("btnEnableNotifications");
    if (enable) enable.addEventListener("click", () => NotificationCenter.enable());
    const refresh = document.getElementById("btnCheckNotifications");
    if (refresh) refresh.addEventListener("click", () => NotificationCenter.check(true));
    const maritim = document.getElementById("settingNotifMaritim");
    const gempa = document.getElementById("settingNotifGempa");
    if (maritim) { maritim.checked = localStorage.getItem("bs10_notif_maritim") !== "false"; maritim.addEventListener("change", () => localStorage.setItem("bs10_notif_maritim", maritim.checked)); }
    if (gempa) { gempa.checked = localStorage.getItem("bs10_notif_gempa") !== "false"; gempa.addEventListener("change", () => localStorage.setItem("bs10_notif_gempa", gempa.checked)); }
    NotificationCenter.render();
    NotificationCenter.updateStatus();
    NotificationCenter.check(false);
    setInterval(() => NotificationCenter.check(false), 10 * 60 * 1000);
  },
  async enable() {
    try {
      const plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
      if (plugin) { const p = await plugin.requestPermissions(); if (p.display !== "granted") throw new Error("permission"); }
      else if ("Notification" in window) { const p = await Notification.requestPermission(); if (p !== "granted") throw new Error("permission"); }
      else throw new Error("unsupported");
      localStorage.setItem("bs10_notif_enabled", "true");
      NotificationCenter.updateStatus("Notifikasi aktif");
      NotificationCenter.check(true);
    } catch (_) { NotificationCenter.updateStatus("Izin notifikasi belum diberikan"); }
  },
  async check(manual) {
    const hashes = NotificationCenter.loadHashes();
    for (const source of NotificationCenter.sources) {
      if (source.id === "bmkg-maritim" && localStorage.getItem("bs10_notif_maritim") === "false") continue;
      if (source.id === "bmkg-gempa" && localStorage.getItem("bs10_notif_gempa") === "false") continue;
      try {
        const r = await fetch(source.url, { cache: "no-store", mode: "cors" });
        if (!r.ok) throw new Error("http");
        const data = source.type === "earthquake" ? await r.json() : await r.text();
        const item = NotificationCenter.normalize(source, data);
        if (!item) continue;
        const hash = NotificationCenter.hash(JSON.stringify(item));
        if (!hashes[source.id]) { hashes[source.id] = hash; continue; }
        if (hash !== hashes[source.id]) { hashes[source.id] = hash; NotificationCenter.add(item); if (!manual) NotificationCenter.notify(item); }
      } catch (_) { /* Sumber gagal diakses: jangan membuat berita atau alert palsu. */ }
    }
    localStorage.setItem(NotificationCenter.hashKey, JSON.stringify(hashes));
    NotificationCenter.updateStatus(manual ? "Pemeriksaan selesai" : null);
    NotificationCenter.render();
  },
  normalize(source, data) {
    if (source.type === "earthquake") {
      const g = data && data.Infogempa && data.Infogempa.gempa; if (!g) return null;
      return { source: source.title, title: "Gempa BMKG: M" + g.Magnitude + " — " + g.Wilayah, body: g.Tanggal + " " + g.Jam + " • Kedalaman " + g.Kedalaman, url: source.url, time: Date.now() };
    }
    const text = String(data).replace(/\\s+/g, " ").trim();
    return { source: source.title, title: "Peringatan maritim BMKG diperbarui", body: "Periksa gelombang tinggi dan wilayah terdampak pada kanal resmi BMKG.", url: source.url, signature: text.slice(0, 3000), time: Date.now() };
  },
  async notify(item) {
    try {
      const plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
      if (plugin) { await plugin.schedule({ notifications: [{ id: Math.floor(Date.now() / 1000) % 2147480000, title: item.title, body: item.body, schedule: { at: new Date(Date.now() + 800) }, extra: { url: item.url } }] }); return; }
      if ("Notification" in window && Notification.permission === "granted") new Notification(item.title, { body: item.body });
    } catch (_) {}
  },
  add(item) { const list = this.load().filter((x) => x.title !== item.title || x.body !== item.body); list.unshift(item); localStorage.setItem(NotificationCenter.key, JSON.stringify(list.slice(0, 30))); },
  load() { try { return JSON.parse(localStorage.getItem(NotificationCenter.key)) || []; } catch (_) { return []; } },
  loadHashes() { try { return JSON.parse(localStorage.getItem(NotificationCenter.hashKey)) || {}; } catch (_) { return {}; } },
  hash(value) { let h = 2166136261; for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); },
  render() { const el = document.getElementById("notifList"); if (!el) return; const list = NotificationCenter.load(); el.innerHTML = list.length ? list.slice(0, 5).map((x) => "<div class='notification-item'><b>" + x.source + "</b><strong>" + x.title + "</strong><span>" + x.body + " • " + new Date(x.time).toLocaleString("id-ID") + "</span></div>").join("") : "<p class='muted'>Belum ada perubahan berita resmi yang tersimpan.</p>"; },
  updateStatus(message) { const el = document.getElementById("notificationStatus"); if (!el) return; if (message) { el.textContent = message; return; } const enabled = localStorage.getItem("bs10_notif_enabled") === "true"; el.textContent = enabled ? "🟢 Notifikasi aktif • pemeriksaan tiap 10 menit saat online" : "🟡 Notifikasi belum diaktifkan"; }
};
