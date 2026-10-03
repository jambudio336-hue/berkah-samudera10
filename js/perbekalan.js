const Perbekalan = {
  init() {
    document.getElementById("btnSimpanBBM").addEventListener("click", Perbekalan.simpanBBM);
    document.getElementById("btnSimpanLogistik").addEventListener("click", Perbekalan.simpanLogistik);
    Perbekalan.render();
  },

  simpanBBM() {
    const jenis = document.getElementById("bJenis").value;
    const jumlah = document.getElementById("bJumlah").value;
    const harga = document.getElementById("bHarga").value;
    if (!jumlah) { alert("Isi jumlah liter, Bos!"); return; }
    Store.add("bbm", { jenis: jenis, jumlah: jumlah, harga: harga || 0 });
    alert("✅ Catatan bahan bakar tersimpan!");
    document.getElementById("bJumlah").value = "";
    document.getElementById("bHarga").value = "";
    Perbekalan.render();
  },

  simpanLogistik() {
    const barang = document.getElementById("lBarang").value;
    const jumlah = document.getElementById("lJumlah").value;
    const harga = document.getElementById("lHarga").value;
    if (!barang || !jumlah) { alert("Isi nama barang dan jumlah, Bos!"); return; }
    Store.add("logistik", { barang: barang, jumlah: jumlah, harga: harga || 0 });
    alert("✅ Catatan logistik tersimpan!");
    document.getElementById("lBarang").value = "";
    document.getElementById("lJumlah").value = "";
    document.getElementById("lHarga").value = "";
    Perbekalan.render();
  },

  render() {
    const bbm = Store.load("bbm");
    const log = Store.load("logistik");
    const el = document.getElementById("listPerbekalan");
    if (bbm.length === 0 && log.length === 0) {
      el.innerHTML = "<p class='muted'>Belum ada catatan perbekalan.</p>";
      return;
    }
    let html = "";
    if (bbm.length > 0) {
      html += "<h4>⛽ Bahan Bakar</h4>" + bbm.map((d) =>
        "<div class='log-item'><b>" + formatTanggal(d.tanggal) + "</b>" +
        "<p>" + d.jenis + " • " + d.jumlah + " liter • Rp " +
        Number(d.harga).toLocaleString("id-ID") + "</p>" +
        "<button class='btn danger sm' data-del='" + d.id + "' data-store='bbm'>🗑️ Hapus</button></div>"
      ).join("");
    }
    if (log.length > 0) {
      html += "<h4>🥘 Logistik</h4>" + log.map((d) =>
        "<div class='log-item'><b>" + formatTanggal(d.tanggal) + "</b>" +
        "<p>" + d.barang + " • " + d.jumlah + " • Rp " +
        Number(d.harga).toLocaleString("id-ID") + "</p>" +
        "<button class='btn danger sm' data-del='" + d.id + "' data-store='logistik'>🗑️ Hapus</button></div>"
      ).join("");
    }
    el.innerHTML = html;
    pasangHapus(el);
  }
};
