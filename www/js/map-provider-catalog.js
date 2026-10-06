const MapProviderCatalog = {
  items: [
    { name: "OpenStreetMap Standard", state: "Aktif · basemap", type: "Global", note: "Atribusi wajib. Tile hanya diminta sesuai area tampilan; tidak ada prefetch/offline. User-Agent APK mengidentifikasi aplikasi.", url: "https://operations.osmfoundation.org/policies/tiles/" },
    { name: "OpenStreetMap HOT", state: "Tidak diaktifkan", type: "Global · style humanitarian", note: "Persyaratan instance OSM France mencakup aplikasi gratis/nirlaba, trafik moderat, dan identifikasi User-Agent; tidak diasumsikan memenuhi syarat distribusi ini.", url: "https://www.openstreetmap.fr/fossiles/" },
    { name: "OpenStreetMap France", state: "Tidak diaktifkan", type: "Global · style OSM-FR", note: "Syarat penggunaan instance gratis dan trafik moderat belum dikonfirmasi untuk aplikasi publik; tidak dipasang sebagai tile aktif.", url: "https://www.openstreetmap.fr/fossiles/" },
    { name: "OpenTopoMap", state: "Aktif · basemap", type: "Global · topografi", note: "Atribusi OpenStreetMap, SRTM dan OpenTopoMap/CC BY-SA 3.0. Layanan best-effort; bukan untuk bulk-download/offline.", url: "https://opentopomap.org/about" },
    { name: "CARTO Positron", state: "Tidak diaktifkan", type: "Global · basemap", note: "Memerlukan key/akun dan ketentuan CARTO; ketentuan penggunaan untuk navigasi kendaraan bergerak tidak cocok untuk kapal.", url: "https://carto.com/basemaps/" },
    { name: "CARTO Dark Matter", state: "Tidak diaktifkan", type: "Global · basemap gelap", note: "Memerlukan key/akun dan terms; tidak menggunakan URL keyless atau mengakali watermark/kuota.", url: "https://carto.com/basemaps/" },
    { name: "CARTO Voyager", state: "Tidak diaktifkan", type: "Global · basemap", note: "Memerlukan key/akun dan terms CARTO yang sesuai; tidak diaktifkan pada build publik ini.", url: "https://carto.com/basemaps/" },
    { name: "Esri World Street Map", state: "Tidak diaktifkan", type: "Global · endpoint legacy", note: "Butuh penetapan lisensi/entitlement untuk APK; layanan legacy dijadwalkan dipensiunkan.", url: "https://www.esri.com/en-us/arcgis/products/arcgis-online/resources/pricing" },
    { name: "Esri World Topographic Map", state: "Tidak diaktifkan", type: "Global · endpoint legacy", note: "Lisensi/entitlement aplikasi belum disahkan; layanan legacy dan bukan sumber chart laut tersertifikasi.", url: "https://www.esri.com/en-us/arcgis/products/arcgis-online/resources/pricing" },
    { name: "Esri World Imagery", state: "Tidak diaktifkan", type: "Global · citra", note: "Hak imagery pihak ketiga dan terms Esri perlu dikonfirmasi; tidak boleh di-prefetch atau disimpan offline tanpa hak.", url: "https://www.esri.com/en-us/arcgis/products/arcgis-online/resources/pricing" },
    { name: "Esri Ocean Basemap", state: "Tidak diaktifkan", type: "Global · peta laut", note: "Ketentuan menyatakan bukan untuk navigasi/keselamatan laut; tidak disajikan sebagai peta pelayaran.", url: "https://www.arcgis.com/home/item.html?id=30e5fe3149c34df1ba922e6f5bbf808f" },
    { name: "Esri National Geographic", state: "Tidak diaktifkan", type: "Global · endpoint legacy", note: "Layanan tidak lagi diperbarui dan sedang menuju pensiun; lisensi penggunaan APK belum disahkan.", url: "https://www.arcgis.com/home/item.html?id=7dc6cea0b1764a1f9af2e679f642f0f5" },
    { name: "NASA GIBS Blue Marble", state: "Aktif · basemap", type: "Global · imagery statis", note: "Resolusi maksimum layanan ini level zoom 8; atribusi NASA Earth Observatory/NASA GIBS. Citra bukan kondisi saat ini.", url: "https://www.earthdata.nasa.gov/data/instruments/gibs" },
    { name: "NASA GIBS VIIRS Nighttime", state: "Katalog · belum diaktifkan", type: "Global · imagery bertanggal", note: "Layer bergantung pada tanggal data dan ketersediaan harian; pemilih tanggal/fallback belum dipasang.", url: "https://www.earthdata.nasa.gov/data/instruments/gibs" },
    { name: "NASA MODIS Corrected Reflectance", state: "Katalog · belum diaktifkan", type: "Global · imagery bertanggal", note: "Layer bertanggal, resolusi zoom rendah, dan ketersediaan waktu dapat berubah; tidak untuk pemantauan real-time.", url: "https://www.earthdata.nasa.gov/data/instruments/gibs" },
    { name: "USGS Topographic Map", state: "Tidak diaktifkan", type: "Amerika Serikat", note: "Cakupan utama Amerika Serikat; tidak sesuai sebagai peta global untuk nelayan Indonesia.", url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer" },
    { name: "USGS Imagery Only", state: "Tidak diaktifkan", type: "Amerika Serikat/territori", note: "Cakupan regional AS dan imagery pihak ketiga; bukan basemap global Indonesia.", url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer" },
    { name: "USGS Shaded Relief", state: "Tidak diaktifkan", type: "Amerika Serikat", note: "Cakupan relief regional AS; bukan model batimetri global.", url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer" },
    { name: "OpenSeaMap Seamarks", state: "Aktif · overlay bersyarat", type: "Global · tanda laut komunitas", note: "Cakupan tidak merata dan bukan chart resmi/ECDIS; gunakan sebagai informasi tambahan saja; layanan tanpa SLA.", url: "https://www.openseamap.org/index.php?id=openseamap&no_cache=1" },
    { name: "GEBCO Bathymetry WMS", state: "Aktif · overlay visualisasi", type: "Global · model kedalaman", note: "Kedalaman adalah model grid global, bukan sounding lokal atau chart keselamatan. Kredit GEBCO dan DOI wajib.", url: "https://www.gebco.net/data-products/gridded-bathymetry-data/" },
    { name: "NOAA Electronic Navigational Charts", state: "Tidak diaktifkan", type: "Amerika Serikat dan Great Lakes", note: "Cakupan regional AS; tidak sesuai dengan perairan Indonesia dan bukan pengganti sistem navigasi tersertifikasi.", url: "https://charts.noaa.gov/InteractiveCatalog/nrnc.shtml" },
    { name: "NOAA Raster Navigational Charts", state: "Tidak diaktifkan · layanan dihentikan", type: "Endpoint tidak aktif", note: "Layanan tile RNC telah dihentikan; endpoint lama tidak dipakai.", url: "https://www.nauticalcharts.noaa.gov/charts/noaa-raster-charts.html" },
    { name: "NOAA nowCOAST", state: "Tidak diaktifkan", type: "AS · cuaca pesisir", note: "Endpoint/layer ID, CORS dan syarat terkini tidak cukup terverifikasi untuk disematkan sebagai tile aplikasi.", url: "https://nowcoast.noaa.gov/" },
    { name: "RainViewer Radar", state: "Aktif · overlay bersyarat", type: "Global · radar cuaca", note: "Hanya penggunaan personal/edukasi; radar lampau, tanpa nowcast; max zoom 7 dan batas request berlaku. Bukan untuk aplikasi komersial tanpa izin.", url: "https://www.rainviewer.com/api.html" },
    { name: "UNEP-WCMC Global Coral Reefs", state: "Tidak diaktifkan · izin diperlukan", type: "Global · dataset dasar", note: "Bukan data real-time. Metadata membatasi redistribusi/penyajian dan penggunaan komersial tanpa izin tertulis; deteksi karang app memakai objek OSM saja.", url: "https://data-gis.unep-wcmc.org/portal/home/item.html?id=0613604367334836863f5c0c10e452bf" }
  ],

  init() {
    const button = document.getElementById("btnMapSources");
    const dialog = document.getElementById("mapProviderDialog");
    const close = document.getElementById("mapProviderClose");
    const search = document.getElementById("mapProviderSearch");
    if (!button || !dialog) return;
    this.render("");
    button.addEventListener("click", () => {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    });
    close?.addEventListener("click", () => {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    });
    search?.addEventListener("input", () => this.render(search.value));
  },

  render(query) {
    const list = document.getElementById("mapProviderList");
    if (!list) return;
    const term = String(query || "").trim().toLocaleLowerCase("id-ID");
    list.replaceChildren();
    this.items.filter((item) => !term || (item.name + " " + item.type + " " + item.state + " " + item.note).toLocaleLowerCase("id-ID").includes(term)).forEach((item) => {
      const card = document.createElement("article");
      card.className = "map-provider-item";
      const head = document.createElement("div");
      head.className = "map-provider-item-head";
      const name = document.createElement("h4");
      name.textContent = item.name;
      const state = document.createElement("span");
      state.className = "map-provider-state" + (item.state.startsWith("Aktif") ? " is-active" : "");
      state.textContent = item.state;
      const type = document.createElement("small");
      type.textContent = item.type;
      const note = document.createElement("p");
      note.textContent = item.note;
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Dokumentasi resmi ↗";
      head.append(name, state);
      card.append(head, type, note, link);
      list.append(card);
    });
    const count = document.getElementById("mapProviderCount");
    if (count) count.textContent = `${this.items.length} ditinjau · ${this.items.filter((item) => item.state.startsWith("Aktif")).length} dipasang`;
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => MapProviderCatalog.init(), { once: true });
} else {
  MapProviderCatalog.init();
}
