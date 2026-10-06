# Marine OS — Data publik dan batas penggunaan

Target aplikasi adalah memprioritaskan data lokal dan layanan publik tanpa kredensial komersial yang ditanam ke APK. “Dapat diakses gratis” tidak berarti bebas kuota, boleh dipakai offline, atau layak untuk navigasi keselamatan.

## Layer yang dipasang

- **OpenStreetMap Standard** — basemap global. Atribusi OSM ditampilkan; tile diminta sesuai viewport, tanpa prefetch/offline cache, mengikuti [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/). APK menambahkan User-Agent yang mengidentifikasi aplikasinya.
- **OpenTopoMap** — basemap topografi, dengan kredit OpenStreetMap/SRTM/OpenTopoMap dan ketentuan CC BY-SA. Best effort tanpa SLA; jangan bulk-download.
- **NASA GIBS Blue Marble** — citra global statis sampai zoom level 8. Bukan citra live; kredit NASA GIBS/NASA Earth Observatory ditampilkan.
- **OpenFreeMap + MapLibre** — mode vektor 3D tanpa API key, lima style Bright/Liberty/Positron/Dark/Fiord. Ikon/bangunan ekstrusi hanya ada jika data vektornya tersedia; ini bukan terrain 3D dasar laut. Kredit penyedia tampil dari style map.
- **OpenSeaMap seamarks** — overlay tanda laut komunitas; cakupan tidak merata, tanpa SLA, bukan chart resmi atau sistem ECDIS.
- **GEBCO 2026 WMS** — visualisasi model batimetri global. Tampilkan kredit/DOI GEBCO. Resolusi dan interpolasi tidak menunjukkan sounding lokal.
- **OpenStreetMap Overpass** — pencarian objek terpetakan dalam radius 1 mil laut saat GPS ada, dengan fair-use dan ketersediaan service publik.
- **RainViewer** — overlay arsip radar untuk penggunaan personal/edukasi, mengambil metadata/path terkini, max zoom 7, batas rate provider berlaku. Bukan nowcast dan jangan gunakan untuk aplikasi komersial tanpa izin.
- **Open-Meteo Marine** — model prakiraan gelombang/arus/cuaca; nilai dapat terlambat, model beresolusi rendah, dan akurasi pesisir terbatas.
- **BMKG Maritim** — sumber publik resmi jika endpoint/format tersedia. Integrasi pihak ketiga/komersial tunduk pada izin dan ketentuan BMKG.

Tile pihak ketiga tidak disimpan oleh service worker. Cache offline hanya untuk aset aplikasi lokal; cache forecast terpisah mengikuti alur data yang ada.

## Tidak diaktifkan pada rilis ini

Riset 25 provider lengkap, termasuk endpoint, syarat penggunaan, coverage, dan alasan keputusan tersedia di [audit 25 sumber peta](map-provider-audit.md) dan dapat dibuka dari menu Peta. Provider berikut tidak dipasang sebagai layer aktif karena key/izin atau syarat kendaraan bergerak yang belum terpenuhi, cakupan hanya AS, layanan dihentikan, layer bertanggal yang memerlukan pemilih tanggal, atau hak distribusi/redistribusi yang perlu izin tertulis:

- CARTO Positron/Dark/Voyager dan tile raster Esri.
- NOAA ENC/nowCOAST/RNC serta layanan USGS yang cakupannya berfokus pada AS.
- NASA VIIRS dan MODIS Corrected Reflectance yang memerlukan integrasi tanggal/fallback.
- Dataset terumbu UNEP-WCMC yang memerlukan penanganan izin lisensi/redistribusi.

## Keselamatan

Peta, kedalaman GEBCO, citra, seamarks, cuaca/arus model, objek karang OSM, dan radar publik bersifat **decision-support**. Hasil karang berasal dari objek yang dipetakan komunitas, bukan pendeteksi sonar; hasil kosong tidak menjamin area bebas karang. Produk ini bukan chart navigasi resmi, ECDIS, sonar, radar/AIS tersertifikasi, alat darurat, ataupun sistem kendali kapal.
