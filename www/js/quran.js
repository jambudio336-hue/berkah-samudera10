const QuranApp = {
  list: [],
  detail: null,
  qari: "01",
  init() {
    const select = document.getElementById("quranSurah");
    const search = document.getElementById("quranSearch");
    const qari = document.getElementById("quranQari");
    if (!select) return;
    if (qari) qari.addEventListener("change", () => { QuranApp.qari = qari.value; QuranApp.renderAudio(); });
    select.addEventListener("change", () => QuranApp.load(Number(select.value)));
    if (search) search.addEventListener("input", () => QuranApp.renderList(search.value));
    QuranApp.fetchList();
  },
  async fetchList() {
    const status = document.getElementById("quranStatus"); if (status) status.textContent = "Mengambil daftar 114 surat...";
    try {
      const r = await fetch("https://equran.id/api/v2/surat", { cache: "no-store" }); const d = await r.json(); if (!d.data || d.data.length !== 114) throw new Error("invalid quran list");
      QuranApp.list = d.data; localStorage.setItem("bs10_quran_list", JSON.stringify(d.data)); QuranApp.populate(); if (status) status.textContent = "114 surat tersedia • sumber resmi data Kemenag melalui EQuran.id";
    } catch (_) {
      try { QuranApp.list = JSON.parse(localStorage.getItem("bs10_quran_list")) || []; } catch (e) { QuranApp.list = []; }
      QuranApp.populate(); if (status) status.textContent = QuranApp.list.length ? "Mode cache lokal • sambungkan internet untuk pembaruan" : "Al-Qur’an butuh internet untuk pertama kali dimuat.";
    }
  },
  populate() {
    const select = document.getElementById("quranSurah"); if (!select) return;
    select.innerHTML = "<option value=''>Pilih surat...</option>" + QuranApp.list.map((x) => "<option value='" + x.nomor + "'>" + x.nomor + ". " + QuranApp.escape(x.namaLatin) + " — " + QuranApp.escape(x.arti) + "</option>").join("");
    QuranApp.renderList("");
  },
  renderList(query) {
    const el = document.getElementById("quranList"); if (!el) return; const q = String(query || "").toLowerCase();
    el.innerHTML = QuranApp.list.filter((x) => !q || String(x.nomor).includes(q) || x.namaLatin.toLowerCase().includes(q) || x.arti.toLowerCase().includes(q)).slice(0, 30).map((x) => "<button class='quran-list-item' data-surah='" + x.nomor + "'><b>" + x.nomor + ". " + QuranApp.escape(x.namaLatin) + "</b><span>" + QuranApp.escape(x.nama) + " • " + x.jumlahAyat + " ayat • " + QuranApp.escape(x.arti) + "</span></button>").join("") || "<p class='muted'>Surat tidak ditemukan.</p>";
    el.querySelectorAll("[data-surah]").forEach((b) => b.addEventListener("click", () => { document.getElementById("quranSurah").value = b.dataset.surah; QuranApp.load(Number(b.dataset.surah)); }));
  },
  async load(number) {
    if (!number) return; const status = document.getElementById("quranStatus"); if (status) status.textContent = "Memuat ayat surat...";
    try {
      const r = await fetch("https://equran.id/api/v2/surat/" + number, { cache: "no-store" }); const d = await r.json(); if (!d.data || !d.data.ayat) throw new Error("invalid surah");
      QuranApp.detail = d.data; localStorage.setItem("bs10_quran_surah_" + number, JSON.stringify(d.data)); QuranApp.render(); if (status) status.textContent = d.data.namaLatin + " dimuat dari EQuran.id • data bersumber dari Kemenag RI";
    } catch (_) {
      try { QuranApp.detail = JSON.parse(localStorage.getItem("bs10_quran_surah_" + number)); QuranApp.render(); if (status) status.textContent = "Mode cache lokal • sambungkan internet untuk pembaruan surat"; } catch (e) { if (status) status.textContent = "Surat gagal dimuat. Periksa koneksi internet."; }
    }
  },
  render() {
    const d = QuranApp.detail; if (!d) return; const title = document.getElementById("quranTitle"); if (title) title.innerHTML = "<b>" + d.nomor + ". " + QuranApp.escape(d.namaLatin) + "</b><span>" + QuranApp.escape(d.nama) + " • " + d.jumlahAyat + " ayat • " + QuranApp.escape(d.arti) + " • " + QuranApp.escape(d.tempatTurun) + "</span>";
    QuranApp.renderAudio(); const el = document.getElementById("quranAyat"); if (el) el.innerHTML = d.ayat.map((a) => "<article class='quran-ayat'><div class='ayat-number'>" + a.nomorAyat + "</div><p class='arabic' dir='rtl'>" + QuranApp.escape(a.teksArab) + "</p><p class='latin'><b>Latin:</b> " + QuranApp.escape(a.teksLatin) + "</p><p class='translation'><b>Artinya:</b> " + QuranApp.escape(a.teksIndonesia) + "</p></article>").join("");
    document.getElementById("quranReader").scrollIntoView({ behavior: "smooth", block: "start" });
  },
  renderAudio() { const audio = document.getElementById("quranAudio"); const label = document.getElementById("quranAudioLabel"); if (!audio || !QuranApp.detail) return; const url = QuranApp.detail.audioFull && QuranApp.detail.audioFull[QuranApp.qari]; if (url) { audio.src = url; audio.load(); if (label) label.textContent = "Audio surat lengkap • qari " + QuranApp.qari; } },
  escape(value) { return String(value == null ? "" : value).replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])); }
};
