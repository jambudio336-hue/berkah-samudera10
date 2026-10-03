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
    "<button class='btn danger sm' data-del='" + d.id + "' data-store='tangkapan'>🗑️ Hapus</button></div>"
  ).join("");
  pasangHapus(el);
}

function pasangHapus(el) {
  el.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Hapus catatan ini?")) {
        Store.remove(btn.dataset.store, btn.dataset.del);
        renderSemuaList();
      }
    });
  });
}

function renderSemuaList() {
  renderTangkapan();
  Kolekting.render();
  Perbekalan.render();
}
