# Changelog — Berkah Samudera10

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
