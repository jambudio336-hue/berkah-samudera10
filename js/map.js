const MapApp = {
  map: null, marker: null, track: null, accuracyCircle: null, lat: null, lon: null,
  watchId: null, lastFix: null, layers: {}, reefMarkers: [], is3D: false,
  init() {
    this.map = L.map("map", { zoomControl: true }).setView([-2.5, 118], 5);
    const street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(this.map);
    const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Tiles &copy; Esri" });
    const bathymetry = L.tileLayer.wms("https://ows.gebco.net/mapserv?", { layers: "GEBCO_LATEST", format: "image/png", transparent: true, opacity: .58, attribution: "Bathymetry &copy; GEBCO" });
    const seamarks = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", { maxZoom: 18, opacity: .9, attribution: "Seamarks &copy; OpenSeaMap" });
    this.layers = { street, satellite, bathymetry, seamarks };
    L.control.layers({ "Peta standar": street, "Satelit": satellite }, { "Kedalaman laut (GEBCO)": bathymetry, "Terumbu/marka (OpenSeaMap)": seamarks }, { collapsed: true, position: "topright" }).addTo(this.map);
    this.track = L.polyline([], { color: "#ffb703", weight: 4, opacity: .9 }).addTo(this.map);
    try {
      const savedTrack = JSON.parse(localStorage.getItem("bs10_track") || "[]");
      if (Array.isArray(savedTrack)) this.track.setLatLngs(savedTrack.slice(-500));
    } catch (_) {}
    this.map.on("click", (e) => { this.cekKedalaman(e.latlng.lat, e.latlng.lng); this.deteksiKarang(e.latlng.lat, e.latlng.lng); });
    document.getElementById("btnCenter").addEventListener("click", () => this.lat !== null ? this.map.setView([this.lat, this.lon], 14) : alert("GPS belum aktif. Nyalakan lokasi di HP."));
    document.getElementById("btnDepth").addEventListener("click", () => this.lat !== null ? this.cekKedalaman(this.lat, this.lon) : alert("GPS belum aktif."));
    document.getElementById("btn3D").addEventListener("click", () => this.toggle3D());
    document.getElementById("btnReef").addEventListener("click", () => this.lat !== null ? this.deteksiKarang(this.lat, this.lon) : alert("GPS belum aktif."));
    this.startGPS();
  },
  startGPS() {
    if (!navigator.geolocation) return this.setPosError("Perangkat tidak mendukung GPS.");
    this.watchId = navigator.geolocation.watchPosition((pos) => this.onPos(pos), () => this.setPosError("GPS tidak dapat diakses. Izinkan lokasi."), { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 });
  },
  onPos(pos) {
    this.lat = pos.coords.latitude; this.lon = pos.coords.longitude;
    const acc = Math.round(pos.coords.accuracy), teksLat = this.lat.toFixed(5) + "°", teksLon = this.lon.toFixed(5) + "°", now = Date.now();
    let speed = Number.isFinite(pos.coords.speed) ? pos.coords.speed * 3.6 : 0;
    if (this.lastFix && now > this.lastFix.time) {
      const dLat = (this.lat - this.lastFix.lat) * 111320, dLon = (this.lon - this.lastFix.lon) * 111320 * Math.cos(this.lat * Math.PI / 180);
      speed = Math.max(speed, Math.sqrt(dLat * dLat + dLon * dLon) / ((now - this.lastFix.time) / 1000) * 3.6);
    }
    this.lastFix = { lat: this.lat, lon: this.lon, time: now };
    document.getElementById("mapLat").textContent = teksLat; document.getElementById("mapLon").textContent = teksLon;
    document.getElementById("dashLat").textContent = "Latitude: " + teksLat; document.getElementById("dashLon").textContent = "Longitude: " + teksLon;
    document.getElementById("dashAcc").textContent = "Akurasi GNSS: " + acc + " m"; document.getElementById("mapSpeed").textContent = speed.toFixed(1) + " km/j";
    const altitude = Number.isFinite(pos.coords.altitude) ? Math.round(pos.coords.altitude) + " m" : "-";
    const heading = Number.isFinite(pos.coords.heading) && pos.coords.heading >= 0 ? Math.round(pos.coords.heading) + "°" : "-";
    document.getElementById("gpsState").textContent = "GNSS aktif • akurasi " + acc + " m • " + new Date().toLocaleTimeString("id-ID");
    document.getElementById("mapTelemetry").textContent = "Ketinggian " + altitude + " • Arah " + heading;
    if (!this.marker) { this.marker = L.marker([this.lat, this.lon]).addTo(this.map); this.map.setView([this.lat, this.lon], 13); } else this.marker.setLatLng([this.lat, this.lon]);
    this.marker.bindPopup("Lokasi Kapal Saya<br>Lat " + teksLat + "<br>Lon " + teksLon + "<br>Kecepatan " + speed.toFixed(1) + " km/j");
    this.accuracyCircle = this.accuracyCircle || L.circle([this.lat, this.lon], { radius: acc, color: "#06d6a0", fillOpacity: .08 }).addTo(this.map);
    this.accuracyCircle.setLatLng([this.lat, this.lon]).setRadius(acc);
    const points = this.track.getLatLngs();
    if (localStorage.getItem("bs10_show_track") === "false") this.track.setStyle({ opacity: 0 }); else this.track.setStyle({ opacity: .9 });
    if (!points.length || this.map.distance(points[points.length - 1], [this.lat, this.lon]) > 8) {
      points.push([this.lat, this.lon]);
      const kept = points.slice(-500); this.track.setLatLngs(kept);
      localStorage.setItem("bs10_track", JSON.stringify(kept.map((p) => ({ lat: p.lat, lng: p.lng }))));
    }
    localStorage.setItem("bs10_lastpos", JSON.stringify({ lat: this.lat, lon: this.lon }));
    if (localStorage.getItem("bs10_auto_center") !== "false" && document.getElementById("page-peta").classList.contains("active") && this.map.getZoom() >= 12) this.map.panTo([this.lat, this.lon], { animate: true, duration: .35 });
    if (window.Weather) Weather.refreshPosition(this.lat, this.lon);
    if (window.LiveSync) LiveSync.publishPosition({ lat: this.lat, lon: this.lon, speed, accuracy: acc });
  },
  setPosError(msg) { document.getElementById("dashAcc").textContent = msg; document.getElementById("gpsState").textContent = "GNSS belum tersedia"; },
  clearTrack() { if (this.track) this.track.setLatLngs([]); localStorage.removeItem("bs10_track"); } ,
  toggle3D() { this.is3D = !this.is3D; document.getElementById("map").classList.toggle("map-3d", this.is3D); document.getElementById("btn3D").textContent = this.is3D ? "🧭 Matikan mode 3D" : "🧭 Mode peta 3D"; document.getElementById("mapMode").textContent = this.is3D ? "Mode 3D visual aktif" : "Mode datar aktif"; setTimeout(() => this.map.invalidateSize(), 450); },
  cekKedalaman(lat, lon) {
    const el = document.getElementById("mapDepth"); el.textContent = "Mengambil elevasi dasar laut...";
    fetch("https://api.open-meteo.com/v1/elevation?latitude=" + lat + "&longitude=" + lon).then((r) => r.json()).then((d) => {
      const elev = Number(d.elevation && d.elevation[0]); const text = elev < 0 ? "🌊 Perkiraan kedalaman: ±" + Math.abs(elev).toFixed(1) + " m" : "⛰️ Titik ini daratan (elevasi " + elev.toFixed(1) + " m)";
      el.textContent = text + " • overlay GEBCO tersedia di layer peta"; document.getElementById("dashDepth").textContent = text; L.popup().setLatLng([lat, lon]).setContent(text).openOn(this.map);
    }).catch(() => { el.textContent = "Gagal mengambil kedalaman. Coba lagi saat online."; });
  },
  deteksiKarang(lat, lon) {
    const el = document.getElementById("reefStatus"); el.textContent = "Memeriksa karang laut di bawah/sekitar kapal (radius 100 m)...";
    const q = "[out:json][timeout:12];(nwr[\"natural\"=\"reef\"](around:100," + lat + "," + lon + ");nwr[\"seamark:type\"=\"reef\"](around:100," + lat + "," + lon + "););out center;";
    fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(q)).then((r) => r.json()).then((d) => {
      this.reefMarkers.forEach((m) => this.map.removeLayer(m)); this.reefMarkers = [];
      (d.elements || []).forEach((x) => { const p = x.lat ? [x.lat, x.lon] : [x.center.lat, x.center.lon]; const m = L.circleMarker(p, { radius: 9, color: "#ef476f", fillColor: "#ef476f", fillOpacity: .85 }).addTo(this.map).bindPopup("⚠️ Karang Laut terpetakan dekat kapal<br>" + (x.tags && (x.tags.name || x.tags.description) || "Data OpenStreetMap")); this.reefMarkers.push(m); });
      el.textContent = this.reefMarkers.length ? "⚠️ TERDETEKSI KARANG LAUT dalam radius 100 m dari kapal — jangan jadikan hasil ini satu-satunya alat navigasi." : "✅ Tidak ada karang laut yang terpetakan dalam radius 100 m dari kapal. Hasil kosong bukan jaminan bebas karang; gunakan sonar/peta resmi.";
    }).catch(() => { el.textContent = "Deteksi karang butuh internet. Aktifkan layer OpenSeaMap untuk marka laut."; });
  }
};
