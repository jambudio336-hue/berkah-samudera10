const PrayerTimes = {
  key: "bs10_prayer_times",
  lastKey: "",
  times: null,
  zone: "",
  names: { Fajr: "Subuh", Dhuhr: "Dzuhur", Asr: "Ashar", Maghrib: "Maghrib", Isha: "Isya" },
  init() {
    const toggle = document.getElementById("settingPrayerNotif");
    if (toggle) { toggle.checked = localStorage.getItem("bs10_prayer_enabled") !== "false"; toggle.addEventListener("change", () => { localStorage.setItem("bs10_prayer_enabled", toggle.checked); if (toggle.checked) PrayerTimes.refresh(); else PrayerTimes.cancelScheduled(); }); }
    const sound = document.getElementById("settingAdhanSound");
    if (sound) { sound.checked = localStorage.getItem("bs10_adhan_sound") !== "false"; sound.addEventListener("change", () => { localStorage.setItem("bs10_adhan_sound", sound.checked); PrayerTimes.refresh(); }); }
    const btn = document.getElementById("btnEnablePrayer"); if (btn) btn.addEventListener("click", () => PrayerTimes.enable());
    PrayerTimes.renderSaved();
    setTimeout(() => PrayerTimes.refresh(), 1200);
    setInterval(() => PrayerTimes.refresh(), 30 * 60 * 1000);
  },
  position() { try { const p = JSON.parse(localStorage.getItem("bs10_lastpos")); return p || { lat: -2.5, lon: 118 }; } catch (_) { return { lat: -2.5, lon: 118 }; } },
  async enable() {
    try {
      const plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
      if (plugin) { const p = await plugin.requestPermissions(); if (p.display !== "granted") throw new Error("permission"); await PrayerTimes.createChannels(plugin); }
      else if ("Notification" in window) { const p = await Notification.requestPermission(); if (p !== "granted") throw new Error("permission"); }
      else throw new Error("unsupported");
      localStorage.setItem("bs10_prayer_enabled", "true"); const t = document.getElementById("prayerStatus"); if (t) t.textContent = "🟢 Pengingat sholat aktif"; PrayerTimes.refresh();
    } catch (_) { const t = document.getElementById("prayerStatus"); if (t) t.textContent = "Izinkan notifikasi Android terlebih dahulu"; }
  },
  async refresh(lat, lon) {
    const p = lat == null ? PrayerTimes.position() : { lat, lon };
    const key = Number(p.lat).toFixed(2) + "," + Number(p.lon).toFixed(2) + "," + new Date().toISOString().slice(0, 10);
    if (key === PrayerTimes.lastKey) return;
    PrayerTimes.lastKey = key;
    try {
      const today = new Date(); const dateParam = String(today.getDate()).padStart(2, "0") + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + today.getFullYear();
      const r = await fetch("https://api.aladhan.com/v1/timings/" + dateParam + "?latitude=" + p.lat + "&longitude=" + p.lon + "&method=20", { cache: "no-store" });
      const d = await r.json(); if (!d.data) throw new Error("no prayer data");
      PrayerTimes.times = d.data.timings; PrayerTimes.zone = d.data.meta && d.data.meta.timezone || "UTC"; localStorage.setItem(PrayerTimes.key, JSON.stringify({ timings: PrayerTimes.times, zone: PrayerTimes.zone, date: d.data.date.gregorian.date, lat: p.lat, lon: p.lon }));
      PrayerTimes.render(d.data.date.gregorian.date); if (localStorage.getItem("bs10_prayer_enabled") !== "false") await PrayerTimes.schedule(d.data.date.gregorian.date);
    } catch (_) { PrayerTimes.lastKey = ""; const s = document.getElementById("prayerStatus"); if (s) s.textContent = "Jadwal sholat butuh internet; menunggu koneksi"; }
  },
  renderSaved() { try { const d = JSON.parse(localStorage.getItem(PrayerTimes.key)); if (d && d.timings) { PrayerTimes.times = d.timings; PrayerTimes.zone = d.zone || "UTC"; PrayerTimes.render(d.date); } } catch (_) {} },
  render(date) {
    const list = Object.keys(PrayerTimes.names).map((k) => "<div class='prayer-row'><b>" + PrayerTimes.names[k] + "</b><span>" + String(PrayerTimes.times[k] || "-").split(" ")[0] + "</span></div>").join("");
    const el = document.getElementById("prayerTimes"); if (el) el.innerHTML = list + "<small class='muted'>Zona waktu lokasi: " + PrayerTimes.zone + " • " + (date || "hari ini") + "</small>";
    const next = PrayerTimes.next(); const n = document.getElementById("nextPrayer"); if (n && next) n.textContent = "Sholat berikutnya: " + next.name + " pukul " + next.time;
  },
  next() { if (!PrayerTimes.times) return null; let current = new Date().getHours() * 60 + new Date().getMinutes(); try { const parts = new Intl.DateTimeFormat("en-GB", { timeZone: PrayerTimes.zone, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()); current = Number(parts.find((x) => x.type === "hour").value) * 60 + Number(parts.find((x) => x.type === "minute").value); } catch (_) {} for (const k of Object.keys(PrayerTimes.names)) { const val = String(PrayerTimes.times[k] || "").split(" ")[0]; const [h, m] = val.split(":").map(Number); if (Number.isFinite(h) && Number.isFinite(m) && h * 60 + m > current) return { name: PrayerTimes.names[k], time: val }; } return { name: "Subuh", time: String(PrayerTimes.times.Fajr || "-").split(" ")[0] + " (besok)" }; },
  localDate(dateText, timeText) {
    const [day, month, year] = dateText.split("-").map(Number); const [hour, minute] = timeText.split(":").map(Number); const guess = Date.UTC(year, month - 1, day, hour, minute); let offset = 0;
    try { const parts = new Intl.DateTimeFormat("en-US", { timeZone: PrayerTimes.zone, timeZoneName: "longOffset" }).formatToParts(new Date(guess)); const raw = (parts.find((x) => x.type === "timeZoneName") || {}).value || "GMT"; const m = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/); if (m) offset = (m[1] === "+" ? 1 : -1) * (Number(m[2]) * 60 + Number(m[3] || 0)); } catch (_) {}
    return new Date(guess - offset * 60000);
  },
  async createChannels(plugin) { try { await plugin.createChannel({ id: "prayer_adhan", name: "Adzan & Waktu Sholat", description: "Pengingat waktu sholat dengan audio adzan", importance: 5, sound: "azan", visibility: 1 }); await plugin.createChannel({ id: "prayer_silent", name: "Waktu Sholat (senyap)", description: "Pengingat waktu sholat tanpa audio", importance: 4, visibility: 1 }); } catch (_) {} },
  async schedule(dateText) {
    const plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications; if (!plugin || !PrayerTimes.times) return;
    await PrayerTimes.createChannels(plugin);
    const ids = JSON.parse(localStorage.getItem("bs10_prayer_ids") || "[]"); if (ids.length) { try { await plugin.cancel({ notifications: ids.map((id) => ({ id })) }); } catch (_) {} }
    const notifications = []; let id = 700000; const soundOn = localStorage.getItem("bs10_adhan_sound") !== "false";
    for (const k of Object.keys(PrayerTimes.names)) { const val = String(PrayerTimes.times[k] || "").split(" ")[0]; if (!/^\d{1,2}:\d{2}$/.test(val)) continue; const at = PrayerTimes.localDate(dateText, val); if (at.getTime() <= Date.now() + 30000) continue; notifications.push({ id: id++, title: "🕌 Waktu " + PrayerTimes.names[k], body: "Telah masuk waktu " + PrayerTimes.names[k] + ". " + PrayerTimes.quotes()[id % PrayerTimes.quotes().length], schedule: { at }, channelId: soundOn ? "prayer_adhan" : "prayer_silent", sound: soundOn ? "azan" : undefined }); }
    if (notifications.length) { try { await plugin.schedule({ notifications }); localStorage.setItem("bs10_prayer_ids", JSON.stringify(notifications.map((x) => x.id))); } catch (_) {} }
  },
  async cancelScheduled() { const plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications; const ids = JSON.parse(localStorage.getItem("bs10_prayer_ids") || "[]"); if (plugin && ids.length) { try { await plugin.cancel({ notifications: ids.map((id) => ({ id })) }); } catch (_) {} } localStorage.removeItem("bs10_prayer_ids"); },
  quotes() { return ["Bismillah, semoga angin bersahabat dan rezeki dilapangkan.", "Sholat tepat waktu, perjalanan lebih tenang.", "Nelayan yang sabar membaca arah angin, pelaut yang kuat menjaga ibadah.", "Laut luas, doa tidak terbatas; berlayarlah dengan ikhtiar dan tawakal.", "Semoga setiap perjalanan pulang membawa keselamatan dan keberkahan."]; }
};
