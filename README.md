<p align="center"><img src="assets/berkah-samudera-animated.svg" alt="Berkah Samudera10" width="100%"></p>

<h1 align="center">Berkah Samudera10</h1>
<p align="center"><b>Aplikasi operasi kapal untuk Android: peta laut, GPS, cuaca model, profil kapal anonim, checklist, dan asisten suara.</b></p>

<p align="center">
  <a href="https://github.com/jambudio336-hue/berkah-samudera10/releases/latest"><img src="https://img.shields.io/github/v/release/jambudio336-hue/berkah-samudera10?style=for-the-badge&color=087FA5" alt="Rilis terbaru"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/status-v1.1.0-087FA5?style=for-the-badge" alt="Versi 1.1.0"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-1f8b4c?style=for-the-badge" alt="MIT license"></a>
</p>

> **Berkah Samudera10** adalah alat bantu informasi dan operasi. Aplikasi ini bukan sistem navigasi tersertifikasi dan tidak menggantikan chart resmi, ECDIS, radar, sonar, lookout, atau prosedur keselamatan.

## Unduh APK

Buka [GitHub Releases](https://github.com/jambudio336-hue/berkah-samudera10/releases/latest) dan unduh `berkah-samudera10-release.apk`. Instalasi sideload tetap memerlukan persetujuan Android. APK signed harus dibangun dengan sertifikat rilis yang sama agar dapat memperbarui instalasi sebelumnya.

## Fitur utama

### Peta laut potret dan GPS

- Peta Leaflet dengan mode imersif potret/layar penuh, pusat GPS, track lokal, rute garis lurus, bearing dan estimasi jarak/waktu.
- Katalog audit berisi **25 provider**; enam sumber publik dipasang sebagai layer aktif/bersyarat. Provider lain tetap terlihat dengan alasan tidak diaktifkan, misalnya lisensi/key, cakupan, service legacy, atau batas penggunaan.
- Layer aktif meliputi OpenStreetMap, OpenTopoMap, NASA GIBS Blue Marble, OpenSeaMap, GEBCO bathymetry, dan RainViewer dengan ketentuan masing-masing.
- Mode peta vektor 3D MapLibre/OpenFreeMap menyediakan lima style: Bright, Liberty, Positron, Dark, dan Fiord. Ini menampilkan geometri/bangunan vektor bila tersedia, **bukan** terrain 3D dasar laut.
- Overlay model laut/cuaca mencakup angin, gelombang, arus dan hujan sesuai ketersediaan layanan. Angka arus/gelombang adalah prakiraan model, bukan pengukuran sensor kapal.
- Pemeriksaan otomatis objek `reef`, batu dangkal, dan wreck dari OpenStreetMap/Overpass dalam radius **1 mil laut** dari posisi GPS. Hasilnya hanya objek yang dipetakan komunitas; bukan sensor/sonar dan hasil kosong tidak membuktikan area aman.
- Marker kapal lain menampilkan nama kapal dan ID anonim jika perangkat pemilik mengaktifkan berbagi lokasi dan sedang online.

Rincian endpoint, lisensi, batas, dan sumber rujukan tersedia di [`docs/map-provider-audit.md`](docs/map-provider-audit.md) dan menu **Katalog 25 sumber** di Peta. Layer yang tidak diaktifkan tidak otomatis menjadi gratis atau boleh dipakai hanya karena endpoint publik dapat diakses.

### Profil kapal tanpa form login

Aplikasi tidak menyediakan halaman daftar/masuk, Story, atau kru. Saat koneksi tersedia, Supabase Anonymous Auth membuat profil tanpa email dan kata sandi. ID tersebut adalah UUID aplikasi, **bukan** IMEI, nomor seri perangkat, atau identitas hardware; nama kapal dapat diubah di Pengaturan.

Berbagi GPS bersifat **off secara default**. Untuk mengirim posisi real-time ke peta pengguna lain, pemilik harus mengaktifkannya dan menyetujui konfirmasi yang menjelaskan nama kapal, ID, koordinat presisi, kecepatan, akurasi, arah, dan waktu update. Pengiriman cloud berlangsung saat aplikasi/WebView aktif, memperoleh GPS, dan online; berbagi dapat dihentikan kembali. Service tracking 24/7 Android hanya menyimpan posisi lokal di perangkat dan tidak mengirim GPS ke cloud di latar belakang. Jika offline, aplikasi menghentikan pengiriman dan mencoba mencabut posisi cloud saat koneksi pulih. Jangan aktifkan di kapal/perangkat orang lain tanpa izin pemilik.

### Kiplay, operasi, dan keselamatan

- Kiplay menyediakan percakapan AI dan membacakan jawaban menggunakan text-to-speech perangkat. Tersedia/tidaknya suara laki-laki tertentu bergantung pada voice pack Android; aplikasi tidak mengkloning suara anak tertentu. Model online memerlukan API key OpenRouter milik pengguna.
- Lokasi tidak dikirim ke AI kecuali izin lokasi untuk AI diaktifkan secara terpisah. API key tidak disimpan di repo atau dimasukkan ke release build.
- Checklist keselamatan disimpan lokal tanpa akun; catatan tangkapan, perbekalan, dan riwayat tetap mengikuti modul lokal yang tersedia.
- Foreground service Android untuk tracking latar belakang menyimpan koordinat di penyimpanan privat perangkat saja; status posisi stale ditampilkan dan tidak dianggap live share.
- Tombol MOB menyimpan titik darurat setelah konfirmasi. SOS menyiapkan teks yang dapat disalin pengguna; keduanya **tidak** menghubungi layanan darurat secara otomatis.
- Aplikasi juga menyediakan halaman prakiraan/cuaca, kompas/telemetri perangkat, Al-Qur’an, dan notifikasi sesuai layanan dan izin perangkat.
- Dashboard menandai secara jujur modul roadmap yang belum tersedia. AIS live, radar perangkat keras, chat, panggilan, peta offline, document vault, dan prediksi hotspot tidak boleh dianggap aktif pada rilis ini.

## Batas data dan keselamatan

- GPS berasal dari perangkat; akurasi dipengaruhi antena, izin, cuaca, dan lingkungan.
- GEBCO adalah model batimetri grid global, bukan sounding lokal. Objek terumbu berasal dari pemetaan OSM, bukan UNEP-WCMC real-time atau sensor bawah air.
- OpenSeaMap adalah seamark komunitas dengan cakupan tidak merata. RainViewer menunjukkan radar lampau dengan batas zoom/ketentuan provider.
- OSM tiles diminta sesuai area yang dilihat, tanpa bulk download atau cache offline. Atribusi ditampilkan; APK memakai User-Agent yang mengidentifikasi aplikasi.
- Peta, model cuaca/arus, kedalaman, dan AI tidak boleh menjadi satu-satunya dasar keputusan navigasi atau darurat. Rincian penggunaan data ada di [`docs/MARINE_OS_ZERO_COST_DATA.md`](docs/MARINE_OS_ZERO_COST_DATA.md).

## Supabase dan konfigurasi

Untuk membuat profil anonim, project Supabase harus mengaktifkan **Allow anonymous sign-ins**. Migrasi skema dan RLS terkait profil kapal/lokasi serta rekaman privat ada di `supabase/migrations/`. Posisi publik hanya dapat dibaca sebagai direktori kapal aktif; berbagi GPS memerlukan opt-in perangkat. Review kebijakan dan skema sebelum mengubah project produksi.

Sinkronisasi catatan cloud tidak diaktifkan otomatis. Credential Supabase yang memang bersifat publik untuk client disimpan pada konfigurasi aplikasi; jangan pernah menambahkan service-role key, password, keystore, atau API key pribadi ke repository.

## Menjalankan pemeriksaan dan membangun

Memerlukan Node.js 22, Java 21, Android SDK, Android build-tools yang sesuai, dan Gradle wrapper.

```bash
npm ci
npm run build:web
npm test
npx cap sync android
./build-release.sh
```

`npm test` memeriksa sintaks JavaScript, ID HTML, aset lokal/service worker, sinkronisasi `www/`, provider peta, default version, dan beberapa aturan integrasi. Skrip build lokal menghasilkan APK unsigned bila keystore rilis tidak tersedia; APK unsigned tidak dapat melakukan pembaruan mulus atas APK signed yang sudah terpasang. Build publik signed dilakukan melalui workflow release repo dan memerlukan secrets keystore yang dikelola pemilik repo.

## Struktur penting

- `index.html`, `css/` — UI Marine OS dan peta potret.
- `js/map.js`, `js/weather.js` — GPS, layer, rute, data cuaca/laut, karang OSM, dan mode 3D.
- `js/map-provider-catalog.js` — katalog audit 25 sumber peta.
- `js/device-profile.js`, `js/supabase-sync.js` — profil anonim dan berbagi lokasi opt-in.
- `js/jarvis-openrouter.js`, `js/safety-checklist.js` — Kiplay dan checklist lokal.
- `scripts/check-project.mjs`, `scripts/sync-web.mjs` — QA dan sinkronisasi source ke `www/`.
- `android/` — wrapper Capacitor Android; `.github/workflows/` — CI dan workflow release.
- `supabase/migrations/` — skema dan kebijakan RLS versi repository.

## Lisensi

Kode sumber asli memakai [MIT License](LICENSE). Peta, tile, citra, dataset, SDK, API, merek, serta konten pihak ketiga **tidak** otomatis dilisensikan oleh MIT; ketentuan provider dan atribusinya berlaku secara terpisah. Aplikasi bersifat decision-support dan diberikan tanpa jaminan keselamatan/akurasi.
