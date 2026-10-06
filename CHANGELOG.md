# Changelog — Berkah Samudera10

## [1.1.0] - 2026-10-06

### Ditambahkan
- Peta potret imersif/layar penuh, kontrol GPS, pemilih sumber peta, katalog audit 25 provider, dan lima style vektor MapLibre/OpenFreeMap.
- Layer peta global beratribusi: OpenStreetMap, OpenTopoMap, NASA GIBS Blue Marble, OpenSeaMap, GEBCO, serta RainViewer dengan pembatasan layanan masing-masing.
- Model Open-Meteo Marine untuk gelombang/arus dan pembacaan angin/cuaca pada HUD; status UI membedakan prakiraan model dari sensor lokal.
- Pemeriksaan objek reef/batu/wreck OSM otomatis di sekitar GNSS hingga radius 1 mil laut, dengan peringatan bahwa data komunitas bukan sonar.
- Profil kapal Supabase Anonymous Auth tanpa form login/email/password; UUID aplikasi otomatis, nama kapal, direktori kapal online, dan GPS real-time opt-in.
- Migrasi RLS untuk profil kapal/lokasi publik yang disetujui pemilik dan rekaman cloud privat per perangkat.
- Kiplay dengan jawaban TTS perangkat, checklist keselamatan lokal, ikon biru samudra, dan status modul jujur.

### Diperbaiki
- Menghapus layar serta modul akun/login, Story, dan kru; semua target navigasi yang tersisa mengarah ke halaman yang tersedia.
- Menghilangkan upload GPS dari Android foreground service; tracking latar belakang kini local-only, sedangkan publikasi ke kapal lain dilakukan oleh WebView terautentikasi saat aplikasi aktif dan setelah opt-in.
- Menghapus endpoint CARTO/Esri/OSM-France dari layer aktif dan tidak lagi menyimpan tile eksternal di service worker.
- Memperbaiki URL RainViewer agar memakai host/path frame terbaru, membatasi zoom, dan mencegah request duplikat.
- Mengganti efek miring CSS palsu dengan renderer vektor MapLibre 3D; marker kapal, rute, cuaca, dan objek yang didukung disinkronkan.
- Menambahkan build web kanonis dan pemeriksaan project sebelum APK dibuat; versi dinaikkan menjadi **1.1.0 / versionCode 10100**.
- QA: 173 assertion project, 27 JavaScript files syntax-checked, browser Chromium peta 2D/3D dan katalog 25 sumber tanpa exception JavaScript.

### Catatan
- Hanya enam dari 25 sumber yang ditinjau dipasang sebagai layer aktif/bersyarat. Provider lain ditampilkan sebagai katalog berstatus tidak aktif karena lisensi/key, cakupan, tanggal data, atau batas layanan.
- Berbagi GPS default mati dan baru berjalan setelah persetujuan perangkat; sinkronisasi posisi cloud berlaku saat aplikasi aktif. Tracking latar belakang Android menyimpan data secara lokal saja.
- ID aplikasi bukan IMEI atau nomor seri hardware; policy profil di project Supabase membatasi insert/update ke UUID auth pemilik.
- 3D adalah peta vektor/bangunan, bukan batimetri bawah laut 3D. GEBCO, karang OSM, cuaca, dan arus bersifat indikatif.
- AIS live, radar perangkat keras, chat, peta offline, document vault, dan prediksi hotspot belum tersedia pada rilis ini.

## [1.0.32] - 2026-10-06
### Ditambahkan
- **Ocean Command Center** dengan quick mode Navigation, Weather, Fishing, HUD, dan AI Briefing hook.
- **Marine Risk Score** lokal dari status GNSS, akurasi, koneksi jaringan, dan pergerakan kapal.
- Mode tampilan **Ocean Dark, Red Night, dan Blackout** untuk operasi malam.
- Fitur **MOB** dengan konfirmasi manusia, pencatatan koordinat/waktu/heading, dan status titik darurat.
- Fitur **SOS preparation** yang menyusun pesan koordinat, kecepatan, dan waktu lalu menyalinnya ke clipboard jika tersedia.
- **Jarvis v2**: pencarian katalog model gratis OpenRouter, local conversation history, hands-free voice, dan rekomendasi berbasis telemetry.
- Service worker cache dinaikkan ke **v9** agar modul Ocean Command tersedia saat offline.
- Dokumentasi privasi API key, izin lokasi, status provider, lisensi data, dan batasan keselamatan diperjelas.

### Diperbaiki
- Mirror `www/` disinkronkan dengan source utama sebelum build Android.
- Versioning Android dinaikkan ke **1.0.32 / versionCode 10032**.
- APK release signed diverifikasi dengan `apksigner`, metadata `aapt`, dan pemeriksaan isi ZIP.
- Pemeriksaan syntax seluruh JavaScript dan `git diff --check` dijalankan sebelum rilis.

### Catatan
- GPS/GNSS, MOB, SOS, risk score, dan Jarvis adalah alat bantu; pengguna tetap memegang kendali dan harus mengikuti prosedur keselamatan resmi.
- MOB/SOS tidak menghubungi layanan darurat secara otomatis.
- `openrouter/free` dan model gratis dapat berubah, memiliki rate limit, dan bergantung pada ketersediaan OpenRouter.
- Provider komersial/berlisensi tidak dianggap aktif tanpa SDK, kredensial, izin, atau perangkat resmi.

## 1.0.31

- Membuat sertifikat signing release baru untuk instalasi baru dan menyiapkan build signed lokal.

## 1.0.30

- Sinkronisasi build `www/` dari source utama secara lengkap, termasuk semua modul Marine OS, Jarvis, updater, tracking, dan aset splash.
- Memperbaiki newline literal pada tag script, cache offline yang tidak lengkap, branding `Samudera`, dan state UI auth guest.
- Build script menghasilkan artifact unsigned yang diberi nama jelas serta meneruskan version code/name secara konsisten.


## [1.0.29] - 2026-10-06
### Ditambahkan
- **Jarvis Voice Captain Assistant** berbasis OpenRouter free router.
- Input suara Bahasa Indonesia melalui Speech Recognition dan output suara melalui Speech Synthesis perangkat.
- Snapshot konteks Marine OS terbaru pada setiap pertanyaan: GNSS, jaringan, modul, provider, status tracking, telemetry UI, dan data lokal yang aman.
- Prompt keselamatan agar Jarvis tidak mengarang AIS, radar, posisi, kedalaman, cuaca, harga, atau data kapal.
- Pengaturan Jarvis: API key pengguna, kecepatan suara, pitch, enable/disable, test, microphone, stop, repeat listening, dan input teks.
- README, lisensi, dan dokumentasi release diperbarui untuk fitur AI dan layanan pihak ketiga.

### Diperbaiki
- Versioning Android dinaikkan menjadi 1.0.29 / versionCode 10029.
- Release workflow dapat dipicu dari branch `release/*` selain tag `v*`, lalu membuat GitHub Release bertag versi secara otomatis.
- Dokumentasi download dan catatan release diselaraskan dengan artefak APK yang benar-benar dipublikasikan.

### Catatan
- Jarvis membutuhkan API key OpenRouter milik pengguna untuk akses model online.
- `openrouter/free` menggunakan model/provider gratis yang dapat berubah; ketersediaan dan rate limit mengikuti OpenRouter.
- API key pada implementasi ini tidak di-hardcode. Pada Android, penyimpanan key masih perlu ditingkatkan ke secure native storage/Keystore untuk hardening produksi.
- Speech Recognition berbasis WebView tidak dijamin selalu aktif/24 jam.

## [1.0.28] - 2026-10-06
### Ditambahkan
- Windy marine layer controls diperluas: angin, hembusan, hujan, akumulasi hujan, gelombang, beberapa swell, wind waves, arus, arus pasang, suhu laut, suhu udara, titik embun, kelembapan, awan, kabut, CAPE, tekanan, visibilitas, dan satelit.
- Marine Toolkit offline: konverter knot/km/j dan NM/km, kalkulator BBM perjalanan dengan cadangan, kalkulator jarak dan bearing antar koordinat, serta salin koordinat GPS.
- Background tracking Android dengan persistent state, restart setelah reboot/app replacement, dan WorkManager untuk pemeriksaan update.
- Google Play In-App Updates dan updater GitHub Release untuk instalasi APK langsung.
- Signed release workflow dengan verifikasi signature dan versionCode otomatis.

### Diperbaiki
- Memperbaiki syntax error updater JavaScript yang membuat CI berhenti pada pemeriksaan sintaks.
- Memperbaiki lifecycle MainActivity untuk Play Update dan WorkManager.
- Memperkeras CI dengan pemeriksaan sintaks semua JavaScript dan build Android debug.
- Menyatukan versioning Android menjadi 1.0.28 / versionCode 10028.
- Menjaga pembaruan APK langsung tetap tunduk pada verifikasi dan konfirmasi installer Android.

### Catatan Windy
- Marine OS menggunakan embed/map resmi Windy dan membuka layer yang tersedia melalui konfigurasi map. Windy menyediakan 40+ layer pada Map Forecast API; ketersediaan layer/model tertentu tetap mengikuti produk dan ketentuan Windy.

## [1.0.27] - 2026-10-04
### Diperbaiki
- Memperbaiki UI lambat/macet saat startup dengan lazy-load iframe Windy; Windy kini baru dimuat saat menu Peta dibuka atau tombol fokus ditekan.
- Menunda request BMKG, notifikasi, jadwal sholat, Supabase, dan daftar Qur’an agar thread UI tidak terbebani bersamaan saat aplikasi mulai.
- Menambahkan atribut `defer` pada Leaflet, Supabase CDN, dan seluruh modul JavaScript.
- Mengubah `preload` video splash menjadi `metadata` agar decoding awal lebih ringan.
- Menaikkan versi cache Service Worker ke v5 agar update JavaScript/CSS tidak tertahan cache lama.

## [1.0.26] - 2026-10-04
### Ditambahkan
- Gerbang awal dengan pilihan Daftar/Masuk Akun atau Lanjut sebagai Pengguna Biasa.
- Tombol Google Maps yang membuka koordinat GPS terkini tanpa API key.
- Latar belakang APK baru dari foto yang diberikan pengguna.
- Kompas nautika 3D dengan bezel logam, tick mark, arah diagonal, jarum dua warna, dan hub realistis.
- Daftar Al-Qur’an menampilkan seluruh 114 surat; setiap surat dapat dibaca dan diputar audionya langsung.

### Diperbaiki
- Panel Windy dibuat responsif portrait/landscape dan menu Windy dibuka penuh di embed resmi.
- Pusat Windy otomatis mengikuti koordinat GPS kapal.
- Deteksi karang diperluas dari 100 m menjadi 1 km dan mencakup reef, terumbu, batu dangkal, serta kapal karam terpetakan.
- Marker risiko di peta menampilkan jenis objek dan radius pencarian.

## [1.0.25] - 2026-10-04
### Ditambahkan
- README GitHub dengan banner SVG animasi kapal dan ombak.
- Statistik jumlah pengikut dan akun yang diikuti.
- Daftar pengikut dan pencarian berdasarkan nama akun/nama kapal.
- Story teks, foto, dan video maksimal 60 detik dengan masa aktif 24 jam.
- Feed Story hanya untuk pengguna yang saling follow.
- Riwayat penonton Story per pengguna.
- Media Story disimpan di bucket privat Supabase Storage.
- Batas maksimal 5.000 pengikut per akun dengan perlindungan trigger database dan advisory lock.

### Diperbaiki
- Memperbaiki bug `SupabaseSync.refreshFriends()` yang tidak tersedia setelah menyimpan profil.
- Menyegarkan daftar following, follower, dan statistik setelah profil/follow berubah.
- Menjalankan audit sintaks seluruh modul JavaScript sebelum release.
- Menyinkronkan modul web terbaru ke folder Capacitor `www` sebelum build APK.

### Catatan Auth
- Email OTP dikirim melalui konfigurasi Email Provider Supabase.
- SMS OTP memerlukan SMS provider Supabase.
- WhatsApp OTP memerlukan provider Twilio WhatsApp yang dikonfigurasi di Supabase.
- Google OAuth memerlukan Google Client ID/Secret dan redirect URL di Supabase.

## [1.0.24] - 2026-10-04
- Release sosial dan Story dengan patch batas follower 5.000.

## [1.0.23] - 2026-10-04
- Story 24 jam, media foto/video/teks, feed mutual follow, dan riwayat tontonan.

## [1.0.22] - 2026-10-04
- Supabase Auth email OTP, SMS OTP, WhatsApp channel, Google OAuth, profil, follow/unfollow, dan lokasi teman realtime.

## [1.1.0] - 2026-10-03
- Splash screen video, latar belakang kustom, icon kapal, dan cache aset utama.

## [1.0.0] - 2026-10-03
- Rilis awal dashboard kapal, GPS, peta, cuaca, catatan operasi, kru, dan mode offline.
