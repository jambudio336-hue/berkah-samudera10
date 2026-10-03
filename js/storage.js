const Store = {
  key: (name) => "bs10_" + name,
  save(name, arr) {
    try {
      localStorage.setItem(Store.key(name), JSON.stringify(arr));
      if (typeof SupabaseSync !== "undefined" && !SupabaseSync.suppress) SupabaseSync.pushCollection(name, arr);
      return true;
    } catch (e) { return false; }
  },
  load(name) {
    try {
      return JSON.parse(localStorage.getItem(Store.key(name))) || [];
    } catch (e) { return []; }
  },
  add(name, item) {
    const arr = Store.load(name);
    item.id = Date.now() + "-" + Math.floor(Math.random() * 1000);
    item.tanggal = new Date().toISOString();
    arr.unshift(item);
    return Store.save(name, arr);
  },
  remove(name, id) {
    return Store.save(name, Store.load(name).filter((x) => x.id !== id));
  },
  mergeRemote(name, item) {
    if (!name || !item || !item.id) return;
    const arr = Store.load(name); const idx = arr.findIndex((x) => String(x.id) === String(item.id));
    if (idx >= 0) arr[idx] = { ...arr[idx], ...item }; else arr.unshift(item);
    if (arr.length > 500) arr.length = 500;
    if (typeof SupabaseSync !== "undefined") SupabaseSync.suppress = true;
    Store.save(name, arr);
    if (typeof SupabaseSync !== "undefined") SupabaseSync.suppress = false;
    if (typeof renderSemuaList === "function") renderSemuaList();
  },
  clearAll() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("bs10_"))
      .forEach((k) => localStorage.removeItem(k));
  }
};

function formatTanggal(iso) {
  const d = new Date(iso);
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli",
    "Agustus","September","Oktober","November","Desember"];
  return hari[d.getDay()] + ", " + d.getDate() + " " + bulan[d.getMonth()] +
    " " + d.getFullYear() + " • " + d.toLocaleTimeString("id-ID");
}
