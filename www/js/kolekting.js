const QUOTES = [
  "Laut adalah hafalan bagi orang yang mencintainya. 🌊",
  "Buat catatan berapa ton yang akan kamu kirim hari ini, biar rezeki tercatat rapi! 📦",
  "Nakhoda yang teliti catatannya, kapalnya tak pernah rugi. ⚓",
  "Setiap ton ikan yang dikirim adalah hasil jerih lelah di tengah samudra. 💪",
  "Catat pengirimanmu, di sana menunggu keluarga yang menantikan. 🏠",
  "Angin baik hari ini — jangan lupa catat berapa ton kirimanmu! 🌤️",
  "Rezeki laut tak akan tertukar, asal dicatat dan dikelola dengan benar. 📒",
  "Tangan yang mencatat hari ini, menentukan untung besok. ✍️"
];

const Kolekting = {
  init() {
    buatPilihanIkan("fishKolekting");
    document.getElementById("btnSimpanKolekting").addEventListener("click", Kolekting.simpan);
    Kolekting.mulaiQuotes();
    Kolekting.render();
  },

  mulaiQuotes() {
    let i = Math.floor(Math.random() * QUOTES.length);
    const el = document.getElementById("quoteKolekting");
    const tampil = () => { el.textContent = '"' + QUOTES[i % QUOTES.length] + '"'; i++; };
    tampil();
    setInterval(tampil, 8000);
  },

  simpan() {
    const ikan = ambilIkanTerpilih("fishKolekting");
    const ton = document.getElementById("kTon").value;
    const tujuan = document.getElementById("kTujuan").value || "-";
    if (!ton) { alert("Isi total kirim berapa ton, Bos!"); return; }
    if (ikan.length === 0) { alert("Pilih ikan yang dikirim."); return; }
    Store.add("kolekting", { ikan: ikan, totalTon: ton, tujuan: tujuan });
    alert("✅ Catatan kolekting tersimpan!");
    document.getElementById("kTon").value = "";
    document.getElementById("kTujuan").value = "";
    bersihkanPilihan("fishKolekting");
    Kolekting.render();
  },

  render() {
    const data = Store.load("kolekting");
    const el = document.getElementById("listKolekting");
    if (data.length === 0) { el.innerHTML = "<p class='muted'>Belum ada catatan kolekting.</p>"; return; }
    el.innerHTML = data.map((d) =>
      "<div class='log-item'><b>" + formatTanggal(d.tanggal) + "</b>" +
      "<p>📦 Kirim " + d.totalTon + " ton ke " + d.tujuan + "</p>" +
      "<p>🐟: " + d.ikan.join(", ") + "</p>" +
      "<button class='btn danger sm' data-del='" + d.id + "' data-store='kolekting'>🗑️ Hapus</button></div>"
    ).join("");
    pasangHapus(el);
  }
};
