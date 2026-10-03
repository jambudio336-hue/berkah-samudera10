# Changelog — Berkah Samudera10

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
