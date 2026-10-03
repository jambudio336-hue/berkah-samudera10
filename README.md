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

Frontend dibungkus menjadi APK native memakai Capacitor. Seluruh data pengguna disimpan lokal di HP dengan localStorage dan jadwal notifikasi Android; backend tidak diperlukan untuk memakai aplikasi.

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

- 🪸 Deteksi karang otomatis setiap GPS bergerak minimal 100 m atau setiap 60 detik, dengan status di dashboard.
- 🌊 Kedalaman otomatis memakai query GEBCO 2020 global dan diperbarui saat posisi berubah.

- 💝 Menu Pengaturan berisi QRIS donasi tanpa menampilkan nominal, penjelasan aplikasi, ucapan terima kasih, dan sponsor by.m4zk1pl4y.

- 🧭 Router peta dengan titik tujuan, jarak NM, kecepatan kapal, dan estimasi tiba lengkap hari/tanggal/jam/detik.
- 🪸 Overlay objek bahaya terpetakan: karang, terumbu, batu, dan kapal karam.
- 🌧️ Overlay radar hujan, arah angin, dan indikasi badai lokal dari data cuaca online.

- 🔔 Notifikasi resmi BMKG dengan izin Android, polling 10 menit saat online, deduplikasi, baseline awal, dan riwayat lokal anti-hoaks.

- 🕌 Jadwal sholat otomatis mengikuti zona waktu koordinat GPS, dengan notifikasi Android terjadwal, pengaturan on/off, dan quotes Islami serta pelaut/nelayan.

- 🕋 Jadwal sholat memakai Aladhan API endpoint bertanggal dan meta timezone koordinat, dengan notifikasi Android lokal terjadwal serta suara notifikasi bawaan perangkat.

- 🔊 Audio adzan dibundel sebagai suara channel notifikasi Android; pengguna dapat mematikan suara adzan tanpa mematikan notifikasinya.

- 📱 Mode local-first: tidak ada backend, akun, atau sinkronisasi server yang diperlukan; data operasi kapal tersimpan di HP pengguna.

- 📴 APK kini local-first sepenuhnya: backend, akun, dan server tidak diperlukan; seluruh data operasional tersimpan di HP pengguna.

- 📖 Menu Al-Qur’an online berisi 114 surat, Arab, latin, terjemahan Indonesia, pilihan enam qari, dan audio surat lengkap.

- ☁️ Supabase Realtime terhubung untuk posisi kapal, data operasi, dan notifikasi; pengguna tetap tanpa akun dengan device ID anonim dan cache lokal.

- ☁️ Supabase project: `berkah-samudera10` di region Singapore, dengan tabel `live_positions`, `app_records`, dan `app_notifications` serta Realtime aktif.

- 🔐 Auth Supabase: email OTP, SMS OTP, opsi WhatsApp OTP jika provider WhatsApp Twilio diaktifkan, Google OAuth, profil nahkoda/ABK, follow/unfollow, dan berbagi lokasi teman.

- 👤 Fitur akun: email OTP, SMS OTP, WhatsApp OTP melalui channel Supabase jika provider Twilio WhatsApp aktif, Google OAuth, profil nahkoda/ABK, follow/unfollow, dan berbagi lokasi teman.

- 📸 Story 24 jam: teks, foto, video maksimal 60 detik, feed hanya untuk mutual follow, statistik pengikut/mengikuti, dan riwayat penonton story. Media memakai bucket Storage privat Supabase.
