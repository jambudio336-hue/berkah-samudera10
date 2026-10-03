const DAFTAR_IKAN = [
  "Ikan Tongkol", "Ikan Tenggiri", "Ikan Banyar", "Ikan Bukur",
  "Ikan Layang Panjang", "Ikan Layang Pendek", "Ikan Layang Koro",
  "Ikan Bukur/Gendut", "Ikan Cumi", "Ikan Selar", "Ikan Tuna",
  "Ikan Bayi Tuna", "Ikan Marlin", "Ikan Hiu"
];

const Tangkapan = {
  init() {
    buatPilihanIkan("fishTangkapan");
    document.getElementById("btnSimpanTangkapan").addEventListener("click", Tangkapan.simpan);
    renderTangkapan();
  },

  simpan() {
    const jam = document.getElementById("tJam").value;
    const ton = document.getElementById("tTon").value;
    const serok = document.getElementById("tSerok").value;
    const ikan = ambilIkanTerpilih("fishTangkapan");
    if (!jam || !ton || !serok) { alert("Isi dulu operasi jam, ton, dan serok, Bos!"); return; }
    if (ikan.length === 0) { alert("Pilih minimal satu jenis ikan."); return; }
    const ok = Store.add("tangkapan", {
      jamOperasi: jam, ton: ton, serok: serok, ikan: ikan
    });
    if (ok) {
      alert("✅ Catatan tangkapan tersimpan otomatis sesuai tanggal & hari!");
      document.getElementById("tJam").value = "";
      document.getElementById("tTon").value = "";
      document.getElementById("tSerok").value = "";
      bersihkanPilihan("fishTangkapan");
      renderTangkapan();
    } else {
      alert("Penyimpanan gagal. Memori penuh?");
    }
  }
};

function buatPilihanIkan(containerId) {
  const box = document.getElementById(containerId);
  DAFTAR_IKAN.forEach((nama) => {
    const label = document.createElement("label");
    label.className = "fish-item";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = nama;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + nama));
    box.appendChild(label);
  });
}

function ambilIkanTerpilih(containerId) {
  return Array.from(document.querySelectorAll("#" + containerId + " input:checked"))
    .map((el) => el.value);
}

function bersihkanPilihan(containerId) {
  document.querySelectorAll("#" + containerId + " input:checked")
    .forEach((el) => (el.checked = false));
}

function renderTangkapan() {
  const data = Store.load("tangkapan");
  const el = document.getElementById("listTangkapan");
  if (data.length === 0) { el.innerHTML = "<p class='muted'>Belum ada catatan.</p>"; return; }
  el.innerHTML = data.map((d) =>
    "<div class='log-item'><b>" + formatTanggal(d.tanggal) + "</b>" +
    "<p>⏱️ Operasi: " + d.jamOperasi + " jam • 🐟 " + d.ton + " ton • 🪣 " + d.serok + " serok</p>" +
    "<p>🍖: " + d.ikan.join(", ") + "</p>" +
    "<button class='btn sm edit' data-edit='" + d.id + "' data-store='tangkapan'>✏️ Edit</button> <button class='btn danger sm' data-del='" + d.id + "' data-store='tangkapan'>🗑️ Hapus</button></div>"
  ).join("");
  pasangHapus(el);
}

function pasangHapus(el) {
  el.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => editCatatan(btn.dataset.store, btn.dataset.edit)));
  el.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Hapus catatan ini?")) {
        Store.remove(btn.dataset.store, btn.dataset.del);
        renderSemuaList();
      }
    });
  });
}

function editCatatan(store, id) {
  const data = Store.load(store); const item = data.find((x) => x.id === id); if (!item) return;
  if (store === "tangkapan") { item.jamOperasi = prompt("Operasi (jam):", item.jamOperasi) || item.jamOperasi; item.ton = prompt("Total ton:", item.ton) || item.ton; item.serok = prompt("Jumlah serok:", item.serok) || item.serok; item.ikan = (prompt("Jenis ikan, pisahkan koma:", item.ikan.join(", ")) || item.ikan.join(", ")).split(",").map((x) => x.trim()).filter(Boolean); }
  if (store === "kolekting") { item.totalTon = prompt("Total kirim (ton):", item.totalTon) || item.totalTon; item.tujuan = prompt("Tujuan/penerima:", item.tujuan) || item.tujuan; item.ikan = (prompt("Jenis ikan, pisahkan koma:", item.ikan.join(", ")) || item.ikan.join(", ")).split(",").map((x) => x.trim()).filter(Boolean); }
  if (store === "bbm") { item.jenis = prompt("Jenis BBM:", item.jenis) || item.jenis; item.jumlah = prompt("Jumlah liter:", item.jumlah) || item.jumlah; item.harga = prompt("Harga total:", item.harga) || item.harga; }
  if (store === "logistik") { item.barang = prompt("Nama barang:", item.barang) || item.barang; item.jumlah = prompt("Jumlah:", item.jumlah) || item.jumlah; item.harga = prompt("Harga total:", item.harga) || item.harga; }
  if (store === "kru") { item.nama = prompt("Nama kru:", item.nama) || item.nama; item.jabatan = prompt("Jabatan kru:", item.jabatan) || item.jabatan; item.hp = prompt("No. HP:", item.hp) || item.hp; }
  Store.save(store, data); renderSemuaList(); Kru.render(); alert("✅ Catatan diperbarui.");
}

function renderSemuaList() {
  renderTangkapan();
  Kolekting.render();
  Perbekalan.render();
}
