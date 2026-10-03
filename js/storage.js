const Store = {
  key: (name) => "bs10_" + name,
  save(name, arr) {
    try {
      localStorage.setItem(Store.key(name), JSON.stringify(arr));
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
