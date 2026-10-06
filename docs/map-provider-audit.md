# Audit 25 sumber peta publik — Berkah Samudera10

Tanggal verifikasi: 2026-10-06. Daftar ini memisahkan **akses teknis** dari **izin penggunaan**. Endpoint yang membalas HTTP 200 tidak otomatis memberi lisensi, kapasitas, kuota, atau SLA.

## Ringkasan keputusan

- **Layer yang dipasang:** OpenStreetMap Standard, OpenTopoMap, NASA Blue Marble, GEBCO WMS (visualisasi model saja), OpenSeaMap seamarks (overlay informasi), dan RainViewer (hanya personal/edukasi, batas zoom/rate berlaku).
- **Mode 3D:** OpenFreeMap + MapLibre, diverifikasi terpisah; tidak dihitung sebagai salah satu dari 25 record riset di tabel berikut. OpenFreeMap tanpa key, tetapi tetap tampilkan atribusi; 3D hanya bangunan/vektor OSM, bukan dasar laut.
- **Sumber lain** dibiarkan nonaktif atau hanya katalog karena lisensi/credential/cakupan regional/endpoint/tanggal model. Tidak aman menyatakan seluruh 25 provider “gratis tanpa batas”.
- Jangan gunakan layer GEBCO, OpenSeaMap, NASA, maupun hasil karang OSM sebagai satu-satunya alat navigasi. Aplikasi bukan ECDIS/chart resmi, AIS, sonar, atau alat keselamatan tersertifikasi.

## 25 kandidat

### 1. OpenStreetMap Standard

- **Keputusan:** Aktif bersyarat
- **Jenis/cakupan:** Raster tile XYZ (PNG), layer Standard / OpenStreetMap Carto.; Global/worldwide; detail and data completeness vary by location and zoom. Not a regional-only service.
- **Endpoint:** `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Key:** Tidak memerlukan API key atau rahasia. Endpoint tile publik; harus mengirim User-Agent unik, stabil, dan mengidentifikasi aplikasi (dengan info kontak disarankan). Akses tetap tunduk pada Tile Usage Policy.
- **Batas/keputusan rilis:** Basemap global. Atribusi ODbL wajib; hanya tile viewport, patuhi cache; tanpa prefetch/offline; rilis Android menambahkan identitas User-Agent aplikasi.
- **Sumber resmi:** [1](https://operations.osmfoundation.org/policies/tiles/) · [2](https://www.openstreetmap.org/copyright) · [3](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines) · [4](https://opendatacommons.org/licenses/odbl/)

### 2. OpenStreetMap HOT (Humanitarian map style / HOT)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Raster XYZ/Slippy Map PNG tiles; subdomain {s}=a,b,c (HTTPS). HOT layer max zoom documented as 19.; Global/worldwide, bukan layanan regional saja: dokumentasi teknis OSM France menyebut basis data dunia dan pembaruan global. Zoom 1–11 diperbarui mingguan; mulai zoom 12 pembaruan mengikuti permintaan tile setelah kontribusi. Uji endpoint publik pada 2026-10-06 mengembalikan HTTP 200 image/png untuk subdomain a pada tile z/x/y 0/0/0 dan tile z12; host tanpa subdomain tile.openstreetmap.fr mengembalikan 404, jadi gunakan template dengan {s}.
- **Endpoint:** `https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`
- **Key:** Tidak. Template HTTPS publik dapat diminta tanpa API key atau kredensial; tile diuji merespons HTTP 200. Akses publik tidak berarti tanpa batas: kebijakan OSM France mensyaratkan penggunaan publik tanpa login, trafik moderat, dan dapat membatasi atau memblokir tanpa pemberitahuan.
- **Batas/keputusan rilis:** OSM France mensyaratkan aplikasi mobile gratis/nirlaba, tanpa login, trafik moderat, User-Agent teridentifikasi; style HOT punya risiko pemeliharaan.
- **Sumber resmi:** [1](https://www.openstreetmap.fr/usage/) · [2](https://www.openstreetmap.fr/fonds-de-carte/) · [3](https://tile.openstreetmap.fr/) · [4](https://wiki.openstreetmap.org/wiki/FR:Serveurs/tile.openstreetmap.fr) · [5](https://wiki.openstreetmap.org/wiki/Raster_tile_providers) · [6](https://wiki.openstreetmap.org/wiki/HOT_style) · [7](https://www.openstreetmap.org/copyright/attribution-guide/) · [8](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines)

### 3. OpenStreetMap France (OSM-FR)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Raster XYZ/Slippy Map tiles (PNG), layer osmfr; Leaflet-compatible; documented subdomains a, b, c; zoom 1–20.; Rendering layer is worldwide, not France-only: official technical documentation describes the FR layer as an OSM global-map style localized for French-speaking users. Tile refresh behavior is not uniform: zooms 0–12 are refreshed weekly worldwide; other tiles are generated on demand/updated as needed. This does not imply guaranteed freshness or availability.
- **Endpoint:** `https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png`
- **Key:** No API key, account, or secret is documented or required. Verified unauthenticated HTTPS requests to a, b, and c tile subdomains returned HTTP 200 image/png for a sample tile. Public accessibility is not unrestricted permission to use the service.
- **Batas/keputusan rilis:** OSM France mensyaratkan app gratis/nirlaba, publik, trafik moderat, dan User-Agent lengkap; tidak diasumsikan memenuhi syarat proyek.
- **Sumber resmi:** [1](https://www.openstreetmap.fr/fonds-de-carte/) · [2](https://www.openstreetmap.fr/usage/) · [3](https://tile.openstreetmap.fr/) · [4](https://wiki.openstreetmap.org/wiki/FR:Serveurs/tile.openstreetmap.fr) · [5](https://www.openstreetmap.org/copyright) · [6](https://forum.openstreetmap.fr/t/abus-dutilisation-des-serveurs-de-tuiles-dosm-france/29513)

### 4. OpenTopoMap

- **Keputusan:** Aktif bersyarat
- **Jenis/cakupan:** XYZ raster tile (PNG), HTTPS; Leaflet konfigurasi subdomains: ['a','b','c'] untuk {s}.; Peta topografi berskala dunia dari OpenStreetMap dan data elevasi SRTM; bukan layanan regional-only. Kelengkapan dan detail bervariasi menurut cakupan sumber. Penyedia menyebut data basis up to date, tetapi bagian peta dapat tertinggal hingga 4 minggu.
- **Endpoint:** `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`
- **Key:** Tidak ada API key atau kredensial yang disebut/diperlukan pada endpoint raster resmi yang didokumentasikan. URL HTTPS a/b/c diuji publik tanpa autentikasi dan merespons HTTP 200 image/png. Ini bukan jaminan akses/SLA mendatang.
- **Batas/keputusan rilis:** Basemap topografi global; atribusi OSM/SRTM/OpenTopoMap dan CC BY-SA 3.0; tanpa bulk-download/offline; best-effort tanpa SLA.
- **Sumber resmi:** [1](https://opentopomap.org/about) · [2](https://opentopomap.org/) · [3](https://opentopomap.org/credits) · [4](https://creativecommons.org/licenses/by-sa/3.0/)

### 5. CARTO Positron

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** XYZ raster tiles (PNG), 256 px; Leaflet-compatible. CARTO's official FAQ maps raster style light_all to vector style positron-gl-style; this is the raster Positron variant. Official CARTO page documents raster zoom 0–20.; Global service/CDN, not limited to a region. Basemap data derives from OpenStreetMap; actual detail/completeness therefore varies by place and source data.
- **Endpoint:** `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=YOUR_CARTO_ISSUED_KEY`
- **Key:** Ya untuk penggunaan yang layak/berlisensi tanpa watermark: minta API key CARTO milik sendiri dan tambahkan sebagai parameter key. Tanpa key, template tile tetap merespons publik (uji tile z=0: HTTP 200 image/png), tetapi CARTO menyatakan tile raster diberi watermark ‘API key required’; jangan menghapus/menyamarkan watermark. Key gratis untuk diminta, bukan berarti layanan tanpa identitas, kuota, syarat, atau risiko.
- **Batas/keputusan rilis:** Memerlukan key CARTO sendiri dan kuota/terms; ketentuan melarang navigasi kendaraan bergerak, sehingga tidak cocok untuk pemakaian kapal.
- **Sumber resmi:** [1](https://docs.carto.com/faqs/carto-basemaps.md) · [2](https://carto.com/basemaps/) · [3](https://carto.com/basemaps/apikey/) · [4](https://carto.com/legal/basemap-terms/) · [5](https://carto.com/attribution/) · [6](https://basemaps.cartocdn.com/gl/positron-gl-style/style.json) · [7](https://basemaps.cartocdn.com/rastertiles/light_all/0/0/0.png)

### 6. CARTO Dark Matter

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Raster XYZ tiles (PNG); 256×256 px, optional @2x retina; OSM tile coordinates, zoom 0–20. Dark Matter is the raster style identifier dark_all (not the vector-style slug dark-matter).; Layanan melalui global CDN dan tidak dinyatakan regional-only; basemap berbasis data OpenStreetMap. CARTO dapat membatasi akses di wilayah tertentu terkait sanksi/peraturan. Tile keyless dapat direspons, tetapi CARTO menyatakan permintaan tanpa API key diberi watermark ‘API key required’; jadi akses tanpa key bukan penggunaan yang sesuai untuk integrasi produksi.
- **Endpoint:** `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key={YOUR_CARTO_KEY}`
- **Key:** YA. API key CARTO sendiri wajib ditambahkan sebagai ?key=... pada URL. Key dapat diminta gratis dengan email, tanpa akun; tidak ada API untuk menerbitkan key. Jangan memakai key orang lain atau membagikan key lintas proyek yang tidak terkait. Untuk APK, buat key milik proyek dan batasi ke aplikasi Android melalui dashboard bila tersedia untuk package/signing identity; anggap key yang tertanam di APK dapat diekstrak, bukan rahasia server.
- **Batas/keputusan rilis:** Memerlukan key dan terms CARTO; terms melarang navigasi kendaraan bergerak; jangan gunakan endpoint keyless/watermark.
- **Sumber resmi:** [1](https://docs.carto.com/faqs/carto-basemaps) · [2](https://carto.com/basemaps/) · [3](https://carto.com/basemaps/apikey/) · [4](https://dashboard.basemaps.carto.com/v1/plans) · [5](https://carto.com/legal/basemap-terms/) · [6](https://carto.com/attribution/) · [7](https://github.com/CartoDB/basemap-styles) · [8](https://basemaps.cartocdn.com/rastertiles/dark_all/0/0/0.png)

### 7. CARTO Voyager

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Raster PNG XYZ tiles (Leaflet-compatible; CARTO’s currently documented global CDN service).; Global/worldwide basemap service, not regional-only; based on OpenStreetMap data, so detail/completeness varies by place. CARTO documents OSM tile coordinates and zoom levels 0–20. The official service metadata and current basemap page document this URL pattern; it is a live hosted service, not an immutable offline dataset.
- **Endpoint:** `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=<CARTO_ISSUED_KEY>`
- **Key:** Yes. CARTO explicitly requires a CARTO-issued API key on every basemaps.cartocdn.com URL. Request via CARTO’s email form (no CARTO account required; key issuance is not an anonymous endpoint). An unauthenticated request may still return tiles but with an “API key required” watermark; that is not supported keyless use. Use a key issued for this app/project, never another account’s key. CARTO supports app restrictions including Android apps; restrict the key where possible.
- **Batas/keputusan rilis:** Memerlukan key dan terms CARTO; terms melarang navigasi kendaraan bergerak; jangan gunakan endpoint keyless/watermark.
- **Sumber resmi:** [1](https://carto.com/basemaps/) · [2](https://docs.carto.com/faqs/carto-basemaps) · [3](https://dashboard.basemaps.carto.com/v1/plans) · [4](https://carto.com/basemaps/apikey/) · [5](https://carto.com/legal/basemap-terms/) · [6](https://carto.com/attribution/) · [7](https://www.openstreetmap.org/copyright) · [8](https://github.com/cartodb/basemap-styles/blob/master/README.md) · [9](https://carto.com/blog/new-voyager-basemap/)

### 8. Esri World Street Map (legacy raster basemap)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Raster XYZ-style tile endpoint (Esri MapServer cached map tiles); JPEG, 256×256, Web Mercator / EPSG:3857. Esri route is /tile/{level}/{row}/{column}, matching Leaflet {z}/{y}/{x}.; Worldwide; street-level detail varies by geography. Esri metadata describes street detail across the United States, much of Canada, Mexico, Europe, Japan, Australia/New Zealand, India, South/Central America, Africa and most of the Middle East; item page also describes worldwide low-detail coverage. Not uniform in detail. Service metadata lists zoom levels 0–23, but actual local data/detail can be lower.
- **Endpoint:** `https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}`
- **Key:** Tidak memerlukan API key/token untuk endpoint legacy ini: metadata resmi terbuka dan permintaan tile /tile/0/0/0 diuji menghasilkan HTTP 200 image/jpeg tanpa kredensial. Ini hanya membuktikan akses teknis publik, bukan hak penggunaan tanpa akun/lisensi; ringkasan syarat item menyebut penggunaan harus dengan Esri software atau ArcGIS Online subscription dan jika tanpa Esri software harus membeli subscription. Jangan samakan akses anonim/gratis dengan penggunaan bebas.
- **Batas/keputusan rilis:** Endpoint legacy; perlu lisensi/entitlement Esri untuk aplikasi; layanan dijadwalkan pensiun Desember 2029.
- **Sumber resmi:** [1](https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer?f=pjson) · [2](https://www.arcgis.com/home/item.html?id=3b93337983e9436f8db950e38a8629af) · [3](https://goto.arcgisonline.com/termsofuse/viewsummary?id=3b93337983e9436f8db950e38a8629af) · [4](https://developers.arcgis.com/documentation/esri-and-data-attribution/) · [5](https://developers.arcgis.com/rest/static-basemap-tiles/) · [6](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/introduction-static-basemap-tiles-service/) · [7](https://www.esri.com/arcgis-blog/products/arcgis-living-atlas/announcements/sunsetting-legacy-basemaps)

### 9. Esri World Topographic Map (legacy raster basemap)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Raster tile service (ArcGIS MapServer cached tiles; JPEG 256×256; Web Mercator EPSG:3857); Global; official service description says map-wide detail to approximately 1:72k, with approximately 1:4k coverage in listed regions (including Australia/New Zealand, India, Europe, Canada, Mexico, continental US/Hawaii, Central/South America, Africa, most Middle East) and approximately 1:1k–1:2k in selected urban areas. Actual detail varies by place/zoom.
- **Endpoint:** `https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`
- **Key:** Tidak untuk endpoint raster legacy di atas: REST service metadata publik dan permintaan tile contoh tanpa token berhasil HTTP 200 (image/jpeg). Namun kelayakan akses teknis bukan izin lisensi. Basemap Topographic v2 pengganti memakai Basemap Styles API dan token/API key (privilege premium:user:basemaps); Esri menyatakan penggunaan tile basemap tersebut dapat dikenai biaya.
- **Batas/keputusan rilis:** Endpoint legacy dan ketentuan lisensi/entitlement Esri belum disahkan untuk APK; layanan dijadwalkan pensiun Desember 2029.
- **Sumber resmi:** [1](https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer?f=pjson) · [2](https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer) · [3](https://goto.arcgisonline.com/maps/World_Topo_Map) · [4](https://goto.arcgisonline.com/termsofuse/viewsummary) · [5](https://developers.arcgis.com/documentation/esri-and-data-attribution/interactive-maps/) · [6](https://developers.arcgis.com/rest/basemap-styles/arcgis-topographic-base-webmap-get/) · [7](https://developers.arcgis.com/documentation/mapping-and-location-services/mapping/basemaps/introduction-basemap-styles-service/) · [8](https://www.esri.com/arcgis-blog/products/arcgis-living-atlas/announcements/sunsetting-legacy-basemaps) · [9](https://www.arcgis.com/home/termsofuse.html)

### 10. Esri World Imagery

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Cached raster tile layer (ArcGIS REST MapServer; 256×256 JPEG, Web Mercator, XYZ row/column order). The public tile URL was opened and returned a JPEG without an API key.; Global coverage: lower-resolution imagery worldwide and higher-resolution aerial/satellite imagery over much of the world's landmass. Resolution and source availability vary by location and zoom; Esri describes imagery as typically 3–5 years current in the item page, so it is not live and content/currency can change.
- **Endpoint:** `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
- **Key:** No key was required for the tested legacy World_Imagery MapServer metadata or tile URL. This is not the newer ArcGIS Static Basemap Tiles service, for which Esri says an ArcGIS Location Platform account is required; its tiles are billed after the free allowance. Public/keyless access to this legacy endpoint is not a usage license or a promise of continued service.
- **Batas/keputusan rilis:** Perlu konfirmasi lisensi MSA dan hak pihak ketiga untuk distribusi APK; jangan offline/cache massal.
- **Sumber resmi:** [1](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9) · [2](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer?f=pjson) · [3](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/1/0/0) · [4](https://www.esri.com/en-us/legal/terms/web-site-service) · [5](https://goto.arcgis.com/termsofuse/viewtermsofuse) · [6](https://developers.arcgis.com/rest/static-basemap-tiles/) · [7](https://developers.arcgis.com/documentation/esri-and-data-attribution/) · [8](https://support.esri.com/en-us/knowledge-base/what-is-the-correct-way-to-cite-an-arcgis-online-basema-000012040) · [9](https://www.esri.com/en-us/legal/overview) · [10](https://www.esri.com/en-us/legal/terms/data-attributions)

### 11. Esri Ocean Basemap (World Ocean Base)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Raster cached map tiles (ArcGIS MapServer; 256×256 px, Web Mercator EPSG:3857); Cakupan dasar global; metadata layanan menyebut skala sekitar 1:577.000 secara global, sekitar 1:72.000 di pesisir AS dan sejumlah area lain, serta sekitar 1:9.000 hanya di area terbatas dengan survei hidrografi regional. Cache menyediakan level 0–16; detail tinggi tidak tersedia merata di seluruh dunia.
- **Endpoint:** `https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}`
- **Key:** Tidak untuk endpoint MapServer legacy di atas: metadata publik dapat dibaca dan permintaan tile tanpa token/API key berhasil mengembalikan HTTP 200 image/jpeg. Ini tidak berarti pemakaian tanpa batas atau bahwa layanan Static Basemap Tiles Esri yang berbeda juga tanpa autentikasi.
- **Batas/keputusan rilis:** Metadata/ketentuan menyatakan tidak untuk navigasi atau keselamatan laut; lisensi aplikasi juga belum disahkan.
- **Sumber resmi:** [1](https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer) · [2](https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer?f=pjson) · [3](https://www.arcgis.com/home/item.html?id=67ab7f7c535c4687b6518e6d2343e8a2) · [4](https://www.esri.com/en-us/legal/terms/web-site-service) · [5](https://developers.arcgis.com/documentation/esri-and-data-attribution/) · [6](https://www.esri.com/en-us/legal/terms/data-attributions)

### 12. Esri National Geographic Map (National Geographic World Map, legacy raster service)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** ArcGIS Server cached raster MapServer tiles (JPEG, 256×256, Web Mercator EPSG:3857); ArcGIS REST tile path uses level/row/column, corresponding to Leaflet {z}/{y}/{x}.; Global at scales down to approximately 1:144,000; more detailed coverage for North America down to approximately 1:9,000. Do not assume detailed coverage elsewhere.
- **Endpoint:** `https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}`
- **Key:** Tidak diperlukan untuk endpoint legacy ini: metadata REST dan tile /tile/0/0/0 berhasil diakses publik tanpa token (HTTP 200). Ini bukan jaminan kuota/akses tanpa batas atau hak komersial. Layanan basemap pengganti/baru Esri memerlukan akun dan API key; jangan mengganti endpoint lama dengan layanan baru tanpa key sendiri.
- **Batas/keputusan rilis:** Endpoint legacy, tidak lagi diperbarui dan dijadwalkan pensiun; lisensi aplikasi belum disahkan.
- **Sumber resmi:** [1](https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer?f=pjson) · [2](https://goto.arcgisonline.com/maps/NatGeo_World_Map) · [3](https://www.arcgis.com/home/item.html?id=f33a34de3a294590ab48f246e99958c9) · [4](https://www.arcgis.com/home/termsofuse.html) · [5](https://developers.arcgis.com/documentation/esri-and-data-attribution/interactive-maps/) · [6](https://www.esri.com/arcgis-blog/products/developers/developers/open-source-developers-time-to-upgrade-to-the-new-arcgis-basemap-layer-service) · [7](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/api-keys/)

### 13. NASA GIBS Blue Marble imagery

- **Keputusan:** Aktif
- **Jenis/cakupan:** NASA GIBS WMTS REST tile endpoint usable as XYZ tiles in Leaflet (EPSG:3857; JPEG).; Global Blue Marble (MODIS), with Web Mercator bounds approximately longitude −180° to 180° and latitude −85.051129° to 85.051129°. The live EPSG:3857 WMTS capabilities identify layer BlueMarble_NextGeneration and GoogleMapsCompatible_Level8; tiles are available only through zoom level 8 in this matrix set. The GIBS layer metadata exposes no TIME dimension, so this endpoint is a static view, not a date/month selector or changing near-real-time imagery. NASA describes Blue Marble: Next Generation source imagery as monthly global composites for 2004; do not assume this GIBS layer exposes those monthly alternatives.
- **Endpoint:** `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_NextGeneration/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg`
- **Key:** Tidak. NASA's published REST template is public; a direct request to the exact XYZ-style URL returned HTTP 200 image/jpeg without credentials or a key. This confirms unauthenticated access at verification time, not an unlimited-use promise.
- **Batas/keputusan rilis:** Global statis; maksimum zoom level 8; tampilkan kredit NASA Earth Observatory dan NASA GIBS; jangan memberi kesan dukungan NASA.
- **Sumber resmi:** [1](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) · [2](https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml) · [3](https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api) · [4](https://nasa-gibs.github.io/gibs-api-docs/map-library-usage/) · [5](https://www.nasa.gov/nasa-brand-center/images-and-media/) · [6](https://earthobservatory.nasa.gov/features/BlueMarble)

### 14. NASA GIBS — VIIRS Suomi NPP Black Marble Nighttime Blue/Yellow Composite (AtSensor M15)

- **Keputusan:** Katalog / belum diaktifkan
- **Jenis/cakupan:** OGC WMTS REST raster tiles (EPSG:3857/Web Mercator), compatible with a Leaflet XYZ tile layer.; Global Suomi NPP VIIRS Day/Night Band nighttime Blue/Yellow composite, within Web Mercator's practical latitude bounds (about 85.051°N–85.051°S). The layer is time-dimensioned by date; official capabilities show the archive begins 2021-04-30 and extends to the capabilities' current date, with gaps in the available daily dates. The linked matrix set is GoogleMapsCompatible_Level8 (use only supported zoom matrices). This is a rendered imagery layer, not raw radiance data.
- **Endpoint:** `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_AtSensor_M15/default/{time}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg`
- **Key:** No. NASA documents GIBS visualizations as public, standards-compliant services hosted at gibs.earthdata.nasa.gov. The exact REST tile URL was fetched without credentials and returned HTTP 200 (image/jpeg); no API key or account secret is needed.
- **Batas/keputusan rilis:** Tanggal valid dapat berlubang dan maksimum zoom 8; integrasi dinamis memerlukan pemilihan tanggal/fallback yang belum ada.
- **Sumber resmi:** [1](https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api) · [2](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) · [3](https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/) · [4](https://nasa-gibs.github.io/gibs-api-docs/access-advanced-topics/) · [5](https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml) · [6](https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_AtSensor_M15/default/2026-10-06/GoogleMapsCompatible_Level8/0/0/0.jpeg) · [7](https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance) · [8](https://www.nasa.gov/nasa-brand-center/images-and-media/)

### 15. NASA GIBS Corrected Reflectance (MODIS Terra, True Color)

- **Keputusan:** Katalog / belum diaktifkan
- **Jenis/cakupan:** NASA GIBS WMTS REST tile, XYZ-compatible path; Web Mercator EPSG:3857; JPEG. For Leaflet, substitute {time} with a supported date (YYYY-MM-DD); GIBS REST path orders tile row before tile column, hence {y}/{x}. The verified layer supports matrix levels 0–8 (nine levels).; Global imagery layer, limited by Web Mercator latitude extent (about 85.051°S–85.051°N) and by the actual satellite observations, clouds, and data availability. This is a time-varying daily MODIS Terra corrected-reflectance true-color visualization, not a static basemap; available dates are not guaranteed for every day and should be checked against current GIBS capabilities/DescribeDomains metadata. The Web Mercator layer is reprojected from geographic imagery by GIBS.
- **Endpoint:** `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
- **Key:** No API key or secret is required for the public GIBS WMTS REST endpoint; NASA documentation describes public services. I verified a direct tile request with no credentials returned HTTP 200 image/jpeg. No service quota/SLA guaranteeing unlimited use was established, so do not treat public/free access as unlimited or guaranteed.
- **Batas/keputusan rilis:** Imagery bertanggal, maksimum zoom 8, ketersediaan waktu bervariasi; butuh pemilih tanggal/fallback.
- **Sumber resmi:** [1](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) · [2](https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml) · [3](https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/) · [4](https://nasa-gibs.github.io/gibs-api-docs/access-advanced-topics/) · [5](https://nasa-gibs.github.io/gibs-api-docs/map-library-usage/) · [6](https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api) · [7](https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance) · [8](https://www.nasa.gov/nasa-brand-center/images-and-media/)

### 16. USGS Topographic Map (USGS Topo)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Layanan tile cache ArcGIS REST MapServer (single fused map cache), tile 256×256, Web Mercator (EPSG:3857), 24 level tile cache (0–23). Urutan URL REST adalah level/row/column; template Leaflet memakai {z}/{y}/{x} agar row/column cocok.; Peta topografi berorientasi Amerika Serikat/The National Map, bukan peta global; initial extent layanan berada pada wilayah AS daratan. Kelengkapan/detail berbeda menurut lokasi dan skala. USGS menyebut kontur US Topo tampak sampai kira-kira skala 1:9.000; skala/data layanan dapat diperbarui dan metadata copyright mencantumkan tanggal refresh (saat diperiksa: 4 September 2026).
- **Endpoint:** `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}`
- **Key:** Tidak. Metadata ArcGIS REST dan tile aktual dapat diakses melalui HTTPS tanpa API key atau rahasia; URL tidak memuat token. Endpoint publik tidak berarti ada SLA atau jaminan tanpa batas untuk volume/availability.
- **Batas/keputusan rilis:** Cakupan peta topografi berfokus pada Amerika Serikat; tidak sesuai sebagai basemap nelayan Indonesia.
- **Sumber resmi:** [1](https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer) · [2](https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer?f=pjson) · [3](https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/3/3/2) · [4](https://apps.nationalmap.gov/services/) · [5](https://www.usgs.gov/faqs/what-are-base-map-services-or-urls-used-national-map) · [6](https://www.usgs.gov/faqs/what-are-terms-uselicensing-map-services-and-data-national-map) · [7](https://www.usgs.gov/news/technical-announcement/usgs-topo-base-map-updates)

### 17. USGS Imagery Only (The National Map)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Tile cache basemap ArcGIS REST MapServer; cached 256×256 tiles in Web Mercator (EPSG:3857), mixed image formats. Public direct tile URL confirmed; no key/token is shown as required.; Imagery basemap focused on the United States and U.S. territories, not a globally complete imagery layer. The service description identifies Blue Marble/Landsat at small-to-medium scales and mostly NAIP in CONUS at large scales; Alaska has 10 m SPOT imagery, and other areas may use partner imagery where NAIP is unavailable. Metadata lists imagery vintage as 2017–2021 CONUS, Hawaii 2013, Alaska 2020, Puerto Rico 2018, and territories 2012–2013, so the imagery is geographically and temporally uneven and may be refreshed. Global Web Mercator tile-cache extent is not evidence of global imagery coverage.
- **Endpoint:** `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}`
- **Key:** Tidak. Metadata REST dan tile endpoint dapat diakses publik tanpa API key/token; tidak ditemukan kebutuhan rahasia untuk aplikasi web.
- **Batas/keputusan rilis:** Cakupan AS/territori AS dan beberapa sumber imagery pihak ketiga; tidak sesuai cakupan aplikasi Indonesia.
- **Sumber resmi:** [1](https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer?f=pjson) · [2](https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/0/0/0) · [3](https://apps.nationalmap.gov/services/) · [4](https://www.usgs.gov/faqs/what-are-base-map-services-or-urls-used-national-map) · [5](https://www.usgs.gov/faqs/what-are-urls-imagery-services-national-map-and-are-they-cached-or-dynamic) · [6](https://www.usgs.gov/faqs/what-are-terms-uselicensing-map-services-and-data-national-map) · [7](https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits)

### 18. USGS Shaded Relief (The National Map)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** ArcGIS REST cached raster tile service; 256×256 PNG tiles, Web Mercator (EPSG:3857), levels 0–23. Public anonymous tile request verified: HTTP 200, image/png. This is shaded relief imagery, not an elevation-query service.; Global small-scale shaded relief from GMTED2010; at medium/large scales uses 3DEP best-available elevation data for the conterminous U.S., Alaska, Hawaii, and U.S. territorial islands, with 30 m coverage also stated for Canada, Mexico, Central America, and the Caribbean. WMTS advertised geographic bounds are approximately longitude −180° to 180° and latitude −88.26° to 84°. Source mix/resolution varies by scale; service metadata says data refreshed April 2025, so content can change over time.
- **Endpoint:** `https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/tile/{z}/{y}/{x}`
- **Key:** Tidak. REST tile endpoint berhasil diakses anonim tanpa token atau API key pada pengujian. Jangan menganggap tidak adanya key berarti tanpa batas: sumber resmi yang dibuka tidak menyatakan kuota, SLA, atau jaminan kapasitas.
- **Batas/keputusan rilis:** Hillshade/topografi beresolusi lebih tinggi terutama AS; bukan cakupan global terverifikasi.
- **Sumber resmi:** [1](https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer) · [2](https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS/1.0.0/WMTSCapabilities.xml) · [3](https://apps.nationalmap.gov/services/) · [4](https://www.usgs.gov/faqs/what-are-base-map-services-or-urls-used-national-map) · [5](https://www.usgs.gov/faqs/what-are-terms-uselicensing-map-services-and-data-national-map) · [6](https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits)

### 19. OpenSeaMap seamarks overlay

- **Keputusan:** Overlay aktif bersyarat
- **Jenis/cakupan:** Raster XYZ/TMS seamark overlay (transparent PNG; Web Mercator tile path {z}/{x}/{y}); officially documented XYZ example is compatible with Leaflet TileLayer.; Intended as a worldwide seamarks layer, but completeness and rendering are uneven and not guaranteed; OpenSeaMap FAQ says chart completion is ongoing. Legacy embedding instructions list 18 zoom levels (maxZoom documentation), so do not assume higher zooms or uniform coverage. Not an authoritative navigational chart.
- **Endpoint:** `https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png`
- **Key:** No API key is shown or required by the official public tile documentation. The documented HTTP tile host redirects to HTTPS; the official HTTPS alias https://tiles.openseamap.org/seamark/ was independently tested with a sample tile returning HTTP 200 image/png. No provider-published quota, rate limit, SLA, or explicit application/commercial traffic policy was found; this is not evidence of unlimited use.
- **Batas/keputusan rilis:** Seamarks komunitas; cakupan tidak merata dan bukan chart navigasi tersertifikasi; atribusi OSM/OpenSeaMap/CC BY-SA 2.0; layanan tanpa SLA.
- **Sumber resmi:** [1](https://www.openseamap.org/index.php?id=faq&L=1) · [2](https://wiki.openseamap.org/wiki/OpenSeaMap-dev:Server) · [3](https://wiki.openseamap.org/wiki/h:De:OpenSeaMap_in_Website) · [4](https://creativecommons.org/licenses/by-sa/2.0/) · [5](https://tiles.openseamap.org/seamark/17/70251/43076.png) · [6](https://operations.osmfoundation.org/policies/tiles/)

### 20. GEBCO bathymetry WMS

- **Keputusan:** Overlay aktif — visualisasi saja
- **Jenis/cakupan:** WMS 1.3.0 (GetMap imagery; bukan XYZ/{z}/{x}/{y} tile template). Gunakan sebagai Leaflet L.tileLayer.wms dengan layer GEBCO_LATEST (shaded relief) atau GEBCO_LATEST_2 (warna elevasi), format image/png atau image/jpeg, dan CRS EPSG:3857.; Global: service metadata menyatakan extent longitude -180 hingga 360 dan latitude -90 hingga 90; mendukung EPSG:4326, EPSG:3395, EPSG:3857. Model global 15 arc-second. GEBCO menyatakan datanya terutama laut dalam dan tidak menyediakan bathymetry detail di banyak perairan dangkal. Lapisan LATEST mengikuti grid terbaru, saat metadata diperiksa GEBCO_2026.
- **Endpoint:** `https://wms.gebco.net/mapserv?`
- **Key:** Tidak: endpoint WMS resmi publik merespons GetCapabilities tanpa kredensial/API key, dan docs resmi memublikasikan endpoint untuk penggunaan dalam aplikasi. Tidak ada kuota/SLA atau jaminan kesinambungan yang ditemukan; jangan mengartikan ketiadaan key sebagai jaminan bebas batas atau produksi.
- **Batas/keputusan rilis:** Model batimetri global GEBCO; wajib kredit tahun/DOI; metadata memperingatkan bukan untuk navigasi/keselamatan laut.
- **Sumber resmi:** [1](https://www.gebco.net/data-products/gebco-web-services/web-map-service) · [2](https://wms.gebco.net/mapserv?request=getcapabilities&service=wms&version=1.3.0) · [3](https://www.gebco.net/data-products/gridded-bathymetry/terms-of-use) · [4](https://www.gebco.net/data-products/gridded-bathymetry-data) · [5](https://www.gebco.net/news/changes-gebco-wms)

### 21. NOAA Electronic Navigational Chart services (NOAA Chart Display Service / NOAACharts)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** Public cached PNG raster tiles (ArcGIS REST MapServer; also exposed as OGC WMTS), EPSG:3857, 256×256. ArcGIS service LODs are 0–16 and are offset by two zoom levels versus conventional Leaflet/Web Mercator zoom numbering; configure Leaflet zoomOffset: 2 (effective app zoom 2–18).; NOAA ENC coverage in U.S. coastal and marine waters and the Great Lakes, including only charted ENC areas (not a universal global basemap). WMTS advertised geographic bounds are approximately longitude −180° to 180°, latitude −64.85° to 76.80°; that bounding rectangle is not evidence of chart coverage throughout it. NOAA says ENC chart images/data update weekly.
- **Endpoint:** `https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/NOAACharts/MapServer/tile/{z}/{y}/{x}`
- **Key:** No key was required or evidenced: the official REST/WMTS metadata is public, and an anonymous HTTPS request to a NOAA tile URL returned a PNG. This verifies current unauthenticated access, not an unlimited-use guarantee; service terms/access may change.
- **Batas/keputusan rilis:** Chart hanya perairan AS dan Great Lakes; bukan untuk wilayah Indonesia dan bukan pengganti sistem navigasi tersertifikasi.
- **Sumber resmi:** [1](https://nauticalcharts.noaa.gov/data/gis-data-and-services.html) · [2](https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/NOAACharts/MapServer) · [3](https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/NOAACharts/MapServer/WMTS/1.0.0/WMTSCapabilities.xml) · [4](https://nauticalcharts.noaa.gov/data/data-licensing.html) · [5](https://nauticalcharts.noaa.gov/updates/coast-survey-launches-noaa-chart-display-service/) · [6](https://nauticalcharts.noaa.gov/charts/noaa-enc.html)

### 22. NOAA Raster Navigational Chart services (RNC Tile Service)

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** RNC raster tile service (historically WMTS/TMS); discontinued; Sebelumnya menyediakan tiles dari NOAA RNC untuk wilayah yang dicakup chart NOAA (wilayah pesisir/maritim AS dan Great Lakes). NOAA menyatakan RNC Tile Service telah dimatikan pada 1 Oktober 2021; produk dan layanan raster tradisional NOAA dinyatakan telah disunset, program selesai Desember 2024. Tidak ada cakupan tile aktif yang dapat dikonfirmasi.
- **Endpoint:** `tidak ada endpoint aktif terverifikasi`
- **Key:** Tidak dapat dipastikan untuk layanan aktif: tidak ditemukan endpoint RNC aktif yang bisa diuji/diintegrasikan, sehingga status API key bukan penentu. URL legacy tileservice.charts.noaa.gov/tileset.html tercantum di pemberitahuan NOAA, tetapi fetch saat riset tidak menghasilkan metadata/isi yang dapat diverifikasi.
- **Batas/keputusan rilis:** Layanan NOAA RNC resmi dihentikan; tidak ada endpoint aktif terverifikasi.
- **Sumber resmi:** [1](https://nauticalcharts.noaa.gov/updates/coast-survey-to-shut-down-the-raster-navigational-chart-tile-service-and-other-related-services/) · [2](https://nauticalcharts.noaa.gov/charts/farewell-to-traditional-nautical-charts.html) · [3](https://nauticalcharts.noaa.gov/data/gis-data-and-services.html) · [4](https://nauticalcharts.noaa.gov/data/data-licensing.html) · [5](https://nauticalcharts.noaa.gov/updates/noaa-releases-new-navigational-chart-viewers/)

### 23. NOAA nowCOAST marine layers

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** OGC Web Map Service (WMS) is officially described; no verified current tile URL template or concrete service endpoint included.; Layanan nowCOAST mencakup kondisi pesisir dan maritim AS; pemberitahuan NOAA 2023 mencantumkan sebagian layer untuk CONUS, Hawaii, Puerto Rico, Alaska, coastal waters, dan BlueTopo, namun juga menyatakan sejumlah dataset lama tidak tersedia dalam layanan cloud baru. Katalog layer dapat berubah; halaman resmi menjelaskan data observasi, analisis, peringatan, prakiraan, dan batimetri. Data waktunya dinamis/near-real-time serta prakiraan.
- **Endpoint:** `tidak ada endpoint aktif terverifikasi`
- **Key:** Tidak ditemukan dokumentasi resmi yang menyatakan API key wajib, tetapi juga tidak dapat diverifikasi bahwa endpoint WMS tertentu saat ini dapat diakses publik tanpa autentikasi. Jangan menganggap tidak ada key dari ketiadaan keterangan.
- **Batas/keputusan rilis:** Endpoint, layer ID, CORS, dan ketentuan penggunaan terkini tidak berhasil diverifikasi.
- **Sumber resmi:** [1](https://nowcoast.noaa.gov/) · [2](https://nauticalcharts.noaa.gov/learn/nowcoast.html) · [3](https://www.weather.gov/media/notification/pdf_2023_24/scn23-12_nowcoast_aab.pdf) · [4](https://nauticalcharts.noaa.gov/data/data-licensing.html) · [5](https://oceanservice.noaa.gov/facts/nowcoast.html) · [6](https://nowcoast.noaa.gov/help/mapservices.shtml)

### 24. RainViewer radar tiles

- **Keputusan:** Overlay aktif bersyarat
- **Jenis/cakupan:** API publik metadata JSON + tile raster PNG komposit radar; bukan tile statis. URL tile berubah mengikuti path frame yang diberikan metadata.; Global komposit dari jaringan 1200+ radar di 150+ negara menurut dokumentasi RainViewer, tetapi cakupan aktual tidak merata dan bergantung pada sumber radar pihak ketiga yang dapat berubah/berhenti. Metadata aktif yang dibuka memuat radar.past (13 frame, kira-kira 10-menit interval selama 2 jam) dan nowcast kosong; tidak ada prakiraan/nowcast yang tersedia.
- **Endpoint:** `{host}{path}/{size}/{z}/{x}/{y}/2/1_1.png — host dan path harus diambil dari metadata aktif https://api.rainviewer.com/public/weather-maps.json, pilih radar.past[].path; ukuran 256 atau 512, z maksimal 7, warna 2 (Universal Blue).`
- **Key:** Tidak perlu API key/secret: metadata dan format URL tile publik, metadata berhasil dibuka langsung. Batas resmi: 100 request per IP per menit; hindari menganggap layanan bebas batas.
- **Batas/keputusan rilis:** Penggunaan personal/edukasi; data radar lampau 2 jam, tanpa nowcast, zoom maksimum 7, batas 100 request/IP/menit; bukan untuk produk komersial tanpa izin.
- **Sumber resmi:** [1](https://www.rainviewer.com/api.html) · [2](https://www.rainviewer.com/api/weather-maps-api.html) · [3](https://api.rainviewer.com/public/weather-maps.json) · [4](https://www.rainviewer.com/api/transition-faq.html) · [5](https://www.rainviewer.com/api/color-schemes.html) · [6](https://www.rainviewer.com/terms.html) · [7](https://github.com/rainviewer/rainviewer-api-example) · [8](https://raw.githubusercontent.com/rainviewer/rainviewer-api-example/master/rainviewer-api-example.html)

### 25. UNEP-WCMC Global Distribution of Coral Reefs

- **Keputusan:** Tidak diaktifkan
- **Jenis/cakupan:** ArcGIS VectorTileServer (vector tiles, PBF/gzipped; not raster XYZ). REST metadata advertises tiles pattern tile/{z}/{y}/{x}.pbf and a Mapbox Style v8 JSON at /resources/styles/root.json. Leaflet core does not render PBF vector tiles natively; use a compatible vector-tile plugin/renderer and retain the required attribution.; Global distribution of warm-water coral reefs in tropical and subtropical regions; this is not a cold-water coral layer. Provider identifies the dataset as version 4.1 (2021 citation); the hosted tile item was updated 6 October 2026, so service/item content may change. License says use the latest version and release year, but disclaims any commitment to keep data current.
- **Endpoint:** `https://data-gis.unep-wcmc.org/server/rest/services/Hosted/Global_Distribution_of_Coral_Reefs/VectorTileServer/tile/{z}/{y}/{x}.pbf`
- **Key:** No key/token was required in verification: the official VectorTileServer metadata, style JSON, and an actual tile URL were anonymously accessible; sample tile returned HTTP 200 (application/octet-stream). No API key parameter appears in the official tile template. This confirms observed public access, not an SLA or assurance it will remain available.
- **Batas/keputusan rilis:** Lisensi membatasi redistribusi/penyajian tile dan mensyaratkan izin tertulis untuk penggunaan komersial; akses anonim bukan izin distribusi.
- **Sumber resmi:** [1](https://data-gis.unep-wcmc.org/portal/home/item.html?id=9f6664a6720f420580f5f54f7925dfee) · [2](https://data-gis.unep-wcmc.org/server/rest/services/Hosted/Global_Distribution_of_Coral_Reefs/VectorTileServer?f=pjson) · [3](https://data-gis.unep-wcmc.org/server/rest/services/Hosted/Global_Distribution_of_Coral_Reefs/VectorTileServer/resources/styles/root.json) · [4](https://resources.unep-wcmc.org/products/0613604367334836863f5c0c10e452bf) · [5](https://www.unep-wcmc.org/policies/general-data-license-excluding-wdpa)

## Detail keselamatan dan operasional

- Pencarian karang aplikasi memakai objek OpenStreetMap yang dipetakan dalam radius **1 mil laut (1.852 m)**. Itu bukan pendeteksi sonar dan data kosong tidak membuktikan area bebas karang.
- Arus, angin, ombak, kedalaman, dan citra berasal dari model/layanan eksternal; tidak dijamin real-time atau akurat di pesisir.
- Layer publik tidak di-prefetch untuk offline. Service worker tidak boleh menyimpan tile provider secara permanen; ikuti kebijakan dan header tiap provider.
