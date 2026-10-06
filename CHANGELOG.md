# Changelog — Berkah Samudera10

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
