# 🌊 Berkah Samudera10

Aplikasi navigasi & manajemen kapal untuk **nelayan Indonesia**. Dibuat dengan modal **0 rupiah**, **tanpa backend**, **tanpa server**, dan **tanpa API key**.

## ✨ Fitur
- 🎬 Splash screen video intro full-screen dengan audio (tanpa tombol kontrol, tidak bisa di-skip)
- 🖼️ Latar belakang aplikasi bergambar
- 🗺️ Peta laut real-time dengan GPS/GNSS, jejak perjalanan, layer satelit, GEBCO bathymetry, dan OpenSeaMap
- 📍 Bujur & lintang real-time posisi kapal
- 🧭 Kompas digital
- 🌊 Perkiraan kedalaman/elevasi titik + overlay bathymetry GEBCO
- 🌤️ Cuaca & ombak real-time (Open-Meteo Weather + Marine API)
- ⚠️ Peringatan cuaca ekstrem / badai otomatis
- 🪸 Deteksi karang terpetakan via OpenStreetMap Overpass (indikatif, bukan peta navigasi resmi)
- 🔌 Backend server/server.js untuk sinkronisasi telemetry WebSocket multi-perangkat
- 📰 Berita & data gempa BMKG
- 🔄 Offline & Online (Service Worker + cache peta + cache video intro)
- 🐟 Catatan hasil tangkapan (jam operasi, ton, serok, 14 jenis ikan)
- 📦 Catatan kolekting/pengiriman dengan quotes berganti otomatis
- ⛽ Catatan perbekalan, logistik & bahan bakar kapal
- 👥 Database kru (Captain, KKM, ABK Biasa, Juru Batu, Tukang Es, Tukang Rish, Gidang, Apit, Koki, Wakil, Juru Arus, Juru Lampu)
- 📋 Riwayat semua catatan tersimpan otomatis di localStorage
- 🕐 Tanggal, jam & waktu real-time

## 🚀 Cara Pakai
1. Buka via GitHub Pages (Settings → Pages → deploy otomatis via Actions)
2. Di HP, buka Chrome → menu → **Add to Home Screen** → jadinya seperti APK
3. Untuk APK asli: build dengan [PWABuilder](https://www.pwabuilder.com) — gratis

## 🔧 Teknologi
HTML5, CSS3, Vanilla JS, Leaflet, Open-Meteo, OpenStreetMap, BMKG, Service Worker.

## 📄 Lisensi
MIT — lihat [LICENSE](LICENSE)

## 🧱 Full-stack dan build APK

Frontend tetap berupa web app yang dibungkus menjadi APK native memakai Capacitor. Backend ada di `server/` dan menyediakan `/health`, `/api/vessels`, serta WebSocket `/telemetry`. Jalankan backend dengan `cd server && npm install && npm start`, lalu set URL backend pada `localStorage` dengan key `bs10_api` atau integrasikan URL deployment Anda.

### Catatan akurasi

- Posisi “dari satelit” berasal dari GNSS perangkat; aplikasi tidak mengambil koordinat dari citra satelit.
- Layer satelit memakai Esri World Imagery. Bathymetry memakai GEBCO; kedalaman titik adalah perkiraan dan harus diverifikasi dengan peta navigasi resmi/alat sounder.
- Deteksi karang hanya menemukan objek yang sudah dipetakan publik di sekitar titik; hasil kosong bukan jaminan bebas karang.
- Build release APK membutuhkan Android SDK/Gradle dan signing keystore.

- 📡 Integrasi GPS/GNSS Android dengan permission lokasi presisi, akurasi, kecepatan, heading, dan rute tersimpan lokal hingga 500 titik. Pelacakan berjalan real-time saat aplikasi aktif di layar.

- 🪸 Deteksi “Karang Laut” pada radius 100 m dari posisi kapal menggunakan data karang terpetakan publik; bukan pengganti sonar atau peta navigasi resmi.

- 🧭 Kompas 3D nautika aktif dari sensor orientasi perangkat, dengan fallback heading GPS saat kapal bergerak.

- 🚢 Marker kapal bergerak mengikuti GPS, dengan kecepatan knot/km-jam, suhu, arah angin, tinggi/periode/arah ombak, dan area koordinat kondisi laut di sekitar kapal.

- 🗺️ Pilihan peta: standar, satelit realistis, topografi, medan, gelap, bathymetry GEBCO, marka/karang OpenSeaMap, serta mode 3D visual.

- 📰 Panel berita/peringatan BMKG Maritim khusus perairan, gelombang, dan bulletin pelayaran, dengan refresh manual serta otomatis setiap 15 menit.

- 🛳️ Ikon launcher APK dan PWA diganti dengan artwork kapal Berkah Samudera dari pengguna.

- 🧩 Dashboard profesional dengan KPI GPS, rute, jumlah catatan, status jaringan, serta tombol operasi terkelompok.

- 🌬️ Embed resmi Windy global dengan fokus koordinat GPS HP, layer angin/ombak, animasi waktu, tekanan, hujan, dan prakiraan ECMWF.

- 🧭 Kompas ditingkatkan dengan sensor absolut/magnetometer, label 16 arah mata angin, dan heading GPS sebagai fallback.

- 📱 Layout adaptif portrait dan landscape, peta membesar saat layar melebar, serta toolbar peta responsif.
