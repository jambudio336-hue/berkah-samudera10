const Kru = {
  init() {
    document.getElementById("btnSimpanKru").addEventListener("click", Kru.simpan);
    Kru.render();
  },

  simpan() {
    const nama = document.getElementById("kruNama").value.trim();
    const jabatan = document.getElementById("kruJabatan").value;
    const hp = document.getElementById("kruHp").value.trim() || "-";
    if (!nama) { alert("Isi nama kru, Bos!"); return; }
    Store.add("kru", { nama: nama, jabatan: jabatan, hp: hp });
    alert("✅ Data kru tersimpan!");
    document.getElementById("kruNama").value = "";
    document.getElementById("kruHp").value = "";
    Kru.render();
  },

  render() {
    const data = Store.load("kru");
    const el = document.getElementById("kruList");
    if (data.length === 0) { el.innerHTML = "<p class='muted'>Belum ada kru terdaftar.</p>"; return; }
    const urutanJabatan = ["Captain", "KKM", "ABK Biasa", "Juru Batu", "Tukang Es", "Tukang Rish", "Gidang", "Apit", "Koki", "Wakil", "Juru Arus", "Juru Lampu"];
    const urut = Object.fromEntries(urutanJabatan.map((jabatan, i) => [jabatan, i]));
    data.sort((a, b) => urut[a.jabatan] - urut[b.jabatan]);
    el.innerHTML = data.map((d) =>
      "<div class='log-item'><b>" + formatTanggal(d.tanggal) + "</b><p><strong>" + d.nama + "</strong> — " + d.jabatan + "</p>" +
      "<p>📱 " + d.hp + "</p>" +
      "<button class='btn sm edit' data-edit='" + d.id + "' data-store='kru'>✏️ Edit</button> <button class='btn danger sm' data-del='" + d.id + "' data-store='kru'>🗑️ Hapus</button></div>"
    ).join("");
    pasangHapus(el);
  }
};
