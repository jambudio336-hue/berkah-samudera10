const MapApp = {
  map: null, marker: null, track: null, accuracyCircle: null, lat: null, lon: null,
  remoteMarkers: {}, remotePruneTimer: null, map3d: null, map3dModule: null, map3dOwnMarker: null, map3dRemoteMarkers: {}, map3dReefMarkers: [], reefData: [], watchId: null, lastFix: null, lastMarineCheck: null, speedKmh: 0, layers: {}, reefMarkers: [], hazardLayer: null, windLayer: null, currentLayer: null, currentMarker: null, stormLayer: null, rainLayer: null, routeLine: null, destinationMarker: null, is3D: false, windyLoaded: false, immersiveNative: false,
  map3dWindMarker: null, map3dCurrentMarker: null, windData: null, currentData: null,
  init() {
    this.map = L.map("map", { zoomControl: false }).setView([-2.5, 118], 5);
    L.control.zoom({ position: "bottomright" }).addTo(this.map);
    const street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' }).addTo(this.map);
    const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { maxZoom: 17, attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, SRTM | Map style &copy; <a href="https://opentopomap.org/about">OpenTopoMap (CC BY-SA)</a>' });
    const nasaBlueMarble = L.tileLayer("https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_NextGeneration/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg", { minZoom: 0, maxZoom: 8, maxNativeZoom: 8, attribution: '<a href="https://www.earthdata.nasa.gov/data/instruments/gibs">NASA GIBS / NASA Earth Observatory</a>' });
    const bathymetry = L.tileLayer.wms("https://wms.gebco.net/mapserv?", { layers: "GEBCO_LATEST", format: "image/png", transparent: true, opacity: .58, attribution: '<a href="https://www.gebco.net/data-products/gridded-bathymetry-data/">Bathymetry model &copy; GEBCO 2026</a> • doi:10.5285/4f68d5c7-45eb-f999-e063-7086abc036fa' });
    const seamarks = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", { maxZoom: 18, opacity: .9, attribution: '<a href="https://www.openseamap.org/">Seamarks &copy; OpenSeaMap</a> / <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
    this.hazardLayer = L.layerGroup(); this.windLayer = L.layerGroup(); this.currentLayer = L.layerGroup(); this.stormLayer = L.layerGroup();
    this.layers = { street, topo, nasaBlueMarble, bathymetry, seamarks, hazards: this.hazardLayer, wind: this.windLayer, current: this.currentLayer, storm: this.stormLayer };
    L.control.layers(
      { "OpenStreetMap": street, "OpenTopoMap (topografi)": topo, "NASA Blue Marble (max zoom 8)": nasaBlueMarble },
      { "GEBCO 2026 (model kedalaman; bukan navigasi)": bathymetry, "OpenSeaMap (tanda laut komunitas)": seamarks, "Objek karang/kapal karam OSM": this.hazardLayer, "Arah angin (model)": this.windLayer, "Arus laut (model)": this.currentLayer, "Indikasi badai (model)": this.stormLayer },
      { collapsed: true, position: "topright" }
    ).addTo(this.map);
    this.track = L.polyline([], { color: "#ffb703", weight: 4, opacity: .9 }).addTo(this.map);
    try {
      const savedTrack = JSON.parse(localStorage.getItem("bs10_track") || "[]");
      if (Array.isArray(savedTrack)) this.track.setLatLngs(savedTrack.slice(-500));
    } catch (_) {}
    this.map.on("click", (e) => { this.cekKedalaman(e.latlng.lat, e.latlng.lng); this.deteksiKarang(e.latlng.lat, e.latlng.lng); const a = document.getElementById("routeLat"), b = document.getElementById("routeLon"); if (a && b) { a.value = e.latlng.lat.toFixed(6); b.value = e.latlng.lng.toFixed(6); } });
    document.getElementById("btnGlobal").addEventListener("click", () => { this.map.fitWorld({ animate: true }); if (this.map3d) this.map3d.easeTo({ center: [118, -2.5], zoom: 4, pitch: 20, duration: 500 }); });
    document.getElementById("btnGoogleMaps").addEventListener("click", () => this.openGoogleMaps());
    document.getElementById("btnWindyFocus").addEventListener("click", () => this.updateWindy(true));
    document.querySelectorAll("[data-windy-overlay]").forEach((b)=>b.addEventListener("click",()=>this.updateWindy(true,b.dataset.windyOverlay)));
    document.getElementById("btnCenter").addEventListener("click", () => { if (this.lat === null) return alert("GPS belum aktif. Nyalakan lokasi di HP."); this.map.setView([this.lat, this.lon], 14); if (this.map3d) this.map3d.easeTo({ center: [this.lon, this.lat], zoom: 14, pitch: 48, duration: 500 }); });
    document.getElementById("btnMapFullscreen").addEventListener("click", () => this.toggleImmersive());
    document.getElementById("btnHudWind").addEventListener("click", () => this.toggleLayer(this.windLayer, "Arah angin"));
    document.getElementById("btnDepth").addEventListener("click", () => this.lat !== null ? this.cekKedalaman(this.lat, this.lon) : alert("GPS belum aktif."));
    document.getElementById("btn3D").addEventListener("click", () => this.toggle3D());
    const styleSelect = document.getElementById("map3dStyle");
    const availableStyles = ["bright", "liberty", "positron", "dark", "fiord"];
    const savedStyle = localStorage.getItem("bs10_map3d_style");
    this.map3dStyle = availableStyles.includes(savedStyle) ? savedStyle : "bright";
    if (styleSelect) {
      styleSelect.value = this.map3dStyle;
      styleSelect.addEventListener("change", () => this.change3DStyle(styleSelect.value));
    }
    document.getElementById("btnReef").addEventListener("click", () => this.lat !== null ? this.deteksiKarang(this.lat, this.lon) : alert("GPS belum aktif."));
    document.getElementById("btnSetRoute").addEventListener("click", () => this.setRoute());
    document.getElementById("btnClearRoute").addEventListener("click", () => this.clearRoute());
    document.getElementById("btnWindOverlay").addEventListener("click", () => this.toggleLayer(this.windLayer, "Arah angin"));
    document.getElementById("btnRainOverlay").addEventListener("click", () => this.toggleRain());
    document.getElementById("btnHazardOverlay").addEventListener("click", () => this.toggleHazards());
    document.getElementById("btnStormOverlay").addEventListener("click", () => this.toggleLayer(this.stormLayer, "Indikasi badai"));
    document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && this.immersiveNative) { document.body.classList.remove("map-immersive"); this.immersiveNative = false; this.syncFullscreenButton(); setTimeout(() => this.map.invalidateSize(), 150); } });
    const freeMapStatus = document.getElementById("freeMapStatus");
    if (freeMapStatus) freeMapStatus.textContent = "Sumber peta yang dipasang telah diaudit; 25 kandidat ditinjau. Periksa katalog untuk batas layanan dan lisensi.";
    this.startGPS();
    this.remotePruneTimer = setInterval(() => this.pruneRemotePositions(), 30000);
    if (typeof DeviceProfile !== "undefined") DeviceProfile.renderMapStatus();
  },
  toggleImmersive() {
    const active = document.body.classList.contains("map-immersive");
    if (active) {
      document.body.classList.remove("map-immersive");
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
      this.immersiveNative = false;
    } else {
      document.body.classList.add("map-immersive");
      const target = document.getElementById("page-peta");
      if (target && target.requestFullscreen) target.requestFullscreen().then(() => {
        this.immersiveNative = true;
        if (screen.orientation && screen.orientation.lock) screen.orientation.lock("portrait").catch(() => {});
      }).catch(() => { this.immersiveNative = false; });
    }
    this.syncFullscreenButton();
    setTimeout(() => this.map.invalidateSize(), 180);
  },
  syncFullscreenButton() {
    const btn = document.getElementById("btnMapFullscreen");
    const active = document.body.classList.contains("map-immersive");
    if (btn) { btn.textContent = active ? "×" : "⛶"; btn.setAttribute("aria-label", active ? "Keluar dari peta layar penuh" : "Buka peta layar penuh"); btn.title = active ? "Keluar dari mode layar penuh" : "Mode peta layar penuh"; }
  },
  startGPS() {
    if (!navigator.geolocation) return this.setPosError("Perangkat tidak mendukung GPS.");
    const options = { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 };
    navigator.geolocation.getCurrentPosition((pos) => this.onPos(pos), () => {}, options);
    this.watchId = navigator.geolocation.watchPosition((pos) => this.onPos(pos), () => this.setPosError("GPS tidak dapat diakses. Izinkan lokasi."), options);
  },
  formatDuration(seconds) { const s=Math.max(0,Number(seconds)||0); if(s<60) return Math.round(s)+" detik"; const min=s/60; if(min<60) return min.toFixed(1)+" menit"; const h=min/60; if(h<24) return h.toFixed(1)+" jam"; const d=h/24; if(d<30) return d.toFixed(1)+" hari"; const mo=d/30.4375; if(mo<12) return mo.toFixed(1)+" bulan"; return (mo/12).toFixed(1)+" tahun"; },
  formatDistanceNm(nm) { const n=Math.max(0,Number(nm)||0); return n<0.01?n.toFixed(3)+" NM":n<10?n.toFixed(2)+" NM":n.toFixed(1)+" NM"; },
  bearingTo(lat1,lon1,lat2,lon2) { const r=Math.PI/180, y=Math.sin((lon2-lon1)*r)*Math.cos(lat2*r), x=Math.cos(lat1*r)*Math.sin(lat2*r)-Math.sin(lat1*r)*Math.cos(lat2*r)*Math.cos((lon2-lon1)*r); return (Math.atan2(y,x)/r+360)%360; },
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
    const fixStatus = document.getElementById("mapFixStatus"); if (fixStatus) fixStatus.textContent = "AKURASI " + acc + " M";
    document.getElementById("dashLat").textContent = "Latitude: " + teksLat; document.getElementById("dashLon").textContent = "Longitude: " + teksLon;
    this.speedKmh = speed;
    const knots = speed / 1.852;
    const routeSpeed = document.getElementById("routeSpeedInfo"); if (routeSpeed) routeSpeed.textContent = "Kecepatan: " + knots.toFixed(1) + " kn";
    if (this.destinationMarker && this.destinationMarker.getLatLng()) { const d=this.destinationMarker.getLatLng(); const br=this.bearingTo(this.lat,this.lon,d.lat,d.lng); const rs=document.getElementById("routeStatus"); if(rs && this.routeLine) { const nm=this.map.distance([this.lat,this.lon],d)/1852; const k=knots>0.5?knots:6; rs.innerHTML="🎯 Ke tujuan: <b>"+this.formatDistanceNm(nm)+"</b> • Haluan: <b>"+br.toFixed(0)+"°</b> • Kecepatan: <b>"+k.toFixed(1)+" kn</b><br>⏱️ Estimasi waktu tersisa: <b>"+this.formatDuration((nm/k)*3600)+"</b>"; } }
    document.getElementById("dashAcc").textContent = "Akurasi GNSS: " + acc + " m"; document.getElementById("mapSpeed").textContent = knots.toFixed(1) + " kn";
    const speedDetail = document.getElementById("mapSpeedDetail"); if (speedDetail) speedDetail.textContent = knots.toFixed(1) + " kn • " + speed.toFixed(1) + " km/j";
    document.getElementById("dashSpeed").textContent = "Kecepatan kapal: " + knots.toFixed(1) + " knot (" + speed.toFixed(1) + " km/j)";
    const altitude = Number.isFinite(pos.coords.altitude) ? Math.round(pos.coords.altitude) + " m" : "-";
    const heading = Number.isFinite(pos.coords.heading) && pos.coords.heading >= 0 ? Math.round(pos.coords.heading) + "°" : "-";
    if (Number.isFinite(pos.coords.heading) && pos.coords.heading >= 0 && typeof App !== "undefined") App.setHeading(pos.coords.heading, "GPS kapal");
    document.getElementById("gpsState").textContent = "GNSS aktif • akurasi " + acc + " m • " + new Date().toLocaleTimeString("id-ID");
    document.getElementById("mapTelemetry").textContent = "Ketinggian " + altitude + " • Arah " + heading + " • Kompas " + (heading === "-" ? "belum tersedia" : heading);
    const trip = document.getElementById("tripTelemetry"); if (trip) { const started = Number(localStorage.getItem("bs10_trip_started")||0); if (speed > 1 && !started) localStorage.setItem("bs10_trip_started", String(now)); const st=Number(localStorage.getItem("bs10_trip_started")||0); trip.textContent = st ? "Waktu perjalanan: " + this.formatDuration((now-st)/1000) : "Perjalanan belum dimulai (kapal diam)"; }
    if (!this.marker) { this.marker = L.marker([this.lat, this.lon], { icon: L.divIcon({ className: "ship-marker", html: "🚢", iconSize: [34, 34], iconAnchor: [17, 17] }) }).addTo(this.map); this.map.setView([this.lat, this.lon], 13); } else this.marker.setLatLng([this.lat, this.lon]);
    this.syncOwnPosition3D(); this.sync3DEnvironmentMarkers();
    if (this.map3d && localStorage.getItem("bs10_auto_center") !== "false" && document.getElementById("page-peta").classList.contains("active")) this.map3d.easeTo({ center: [this.lon, this.lat], duration: 350 });
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
    if (typeof Weather !== "undefined") Weather.refreshPosition(this.lat, this.lon);
    this.updateWindy(false);
    this.autoMarineCheck();
    if (typeof PrayerTimes !== "undefined") PrayerTimes.refresh(this.lat, this.lon);
    if (typeof SupabaseSync !== "undefined") SupabaseSync.publishPosition({ lat: this.lat, lon: this.lon, speed, accuracy: acc, heading: Number.isFinite(pos.coords.heading) ? pos.coords.heading : null });
  },
  updateRemotePosition(row) {
    if (!this.map || !row) return;
    const id = String(row.device_id || row.vessel_id || "");
    const lat = Number(row.lat), lon = Number(row.lon);
    if (!id || id === (typeof SupabaseSync !== "undefined" ? SupabaseSync.vesselId() : "") || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const name = String(row.vessel_name || row.display_name || "Kapal Samudera").trim().slice(0, 60) || "Kapal Samudera";
    const updatedAt = Date.parse(row.updated_at || "") || Date.now();
    const shortId = id.replace(/-/g, "").slice(-8).toUpperCase();
    const tooltip = this.escapeHTML(name) + " · #" + this.escapeHTML(shortId);
    const speed = Number(row.speed_knots || 0);
    const accuracy = Number(row.accuracy_m || 0);
    const heading = Number.isFinite(Number(row.heading)) ? Math.round(Number(row.heading)) + "°" : "—";
    const popup = "🚢 <b>" + this.escapeHTML(name) + "</b><br>ID perangkat: <code>" + this.escapeHTML(id) + "</code><br>Kecepatan: " + speed.toFixed(1) + " kn<br>Haluan: " + heading + "<br>Akurasi GPS: " + accuracy.toFixed(0) + " m<br>Diperbarui: " + new Date(updatedAt).toLocaleTimeString("id-ID") + "<br><small>Lokasi hanya muncul saat pemilik kapal mengaktifkan berbagi. Bukan data AIS resmi.</small>";
    let record = this.remoteMarkers[id];
    if (!record) {
      const marker = L.marker([lat, lon], { icon: L.divIcon({ className: "remote-ship-marker", html: "🚢", iconSize: [30, 30], iconAnchor: [15, 15] }) }).addTo(this.map);
      marker.bindTooltip(tooltip, { permanent: true, direction: "top", offset: [0, -12], className: "remote-vessel-tooltip" });
      marker.bindPopup(popup);
      record = this.remoteMarkers[id] = { marker, id, name, lat, lon, updatedAt };
    } else {
      record.marker.setLatLng([lat, lon]);
      record.marker.setTooltipContent(tooltip);
      record.marker.setPopupContent(popup);
      Object.assign(record, { name, lat, lon, updatedAt });
    }
    this.syncRemotePosition3D(record);
    this.renderSharedVessels();
  },
  syncOwnPosition3D() {
    if (!this.map3d || !this.map3dModule || this.lat === null || !this.map3d.isStyleLoaded()) return;
    if (!this.map3dOwnMarker) {
      const element = document.createElement("div"); element.className = "maplibre-own-ship"; element.textContent = "🚢";
      const popup = new this.map3dModule.Popup({ offset: 22 }).setText("Lokasi kapal saya • posisi GPS perangkat ini");
      this.map3dOwnMarker = new this.map3dModule.Marker({ element }).setLngLat([this.lon, this.lat]).setPopup(popup).addTo(this.map3d);
    } else this.map3dOwnMarker.setLngLat([this.lon, this.lat]);
  },
  syncRemotePosition3D(record) {
    if (!record || !this.map3d || !this.map3dModule || !this.map3d.isStyleLoaded()) return;
    const shortId = record.id.replace(/-/g, "").slice(-8).toUpperCase();
    const popup = this.map3dModule.Popup ? new this.map3dModule.Popup({ offset: 22 }).setHTML("🚢 <b>" + this.escapeHTML(record.name) + "</b><br>ID perangkat: <code>" + this.escapeHTML(record.id) + "</code><br><small>#" + this.escapeHTML(shortId) + " • lokasi dibagikan pemilik</small>") : null;
    let marker = this.map3dRemoteMarkers[record.id];
    if (!marker) {
      const element = document.createElement("div"); element.className = "maplibre-remote-ship"; element.textContent = "🚢";
      marker = this.map3dRemoteMarkers[record.id] = new this.map3dModule.Marker({ element }).setLngLat([record.lon, record.lat]).addTo(this.map3d);
    } else marker.setLngLat([record.lon, record.lat]);
    if (popup) marker.setPopup(popup);
  },
  sync3DRoute() {
    if (!this.map3d || !this.map3d.isStyleLoaded()) return;
    const data = this.routeLine ? this.routeLine.toGeoJSON() : { type: "FeatureCollection", features: [] };
    const source = this.map3d.getSource("bs10-route");
    if (source) source.setData(data);
    else {
      this.map3d.addSource("bs10-route", { type: "geojson", data });
      this.map3d.addLayer({ id: "bs10-route-line", type: "line", source: "bs10-route", paint: { "line-color": "#06d6a0", "line-width": 4, "line-dasharray": [2, 2] } });
    }
  },
  render3DReefMarkers() {
    if (!this.map3d || !this.map3dModule || !this.map3d.isStyleLoaded()) return;
    this.map3dReefMarkers.forEach((marker) => marker.remove()); this.map3dReefMarkers = [];
    this.reefData.forEach((point) => {
      const element = document.createElement("div"); element.className = "maplibre-remote-ship"; element.textContent = point.symbol;
      const popup = new this.map3dModule.Popup({ offset: 22 }).setText(point.label + " • " + point.name + " • Sumber OpenStreetMap");
      this.map3dReefMarkers.push(new this.map3dModule.Marker({ element }).setLngLat([point.lon, point.lat]).setPopup(popup).addTo(this.map3d));
    });
  },
  removeRemotePosition(row) {
    const id = String(row && (row.device_id || row.vessel_id) || "");
    if (!id) return;
    if (this.remoteMarkers[id]) { this.remoteMarkers[id].marker.remove(); delete this.remoteMarkers[id]; }
    if (this.map3dRemoteMarkers[id]) { this.map3dRemoteMarkers[id].remove(); delete this.map3dRemoteMarkers[id]; }
    this.renderSharedVessels();
  },
  pruneRemotePositions() {
    const cutoff = Date.now() - 5 * 60 * 1000;
    Object.keys(this.remoteMarkers).forEach((id) => { if (this.remoteMarkers[id].updatedAt < cutoff) this.removeRemotePosition({ device_id: id }); });
  },
  renderSharedVessels() {
    const list = document.getElementById("sharedVesselList");
    const count = document.getElementById("sharedVesselCount");
    const status = document.getElementById("sharedVesselLiveStatus");
    const entries = Object.values(this.remoteMarkers).sort((a, b) => b.updatedAt - a.updatedAt);
    if (count) count.textContent = entries.length + " kapal";
    if (status) status.textContent = entries.length ? entries.length + " kapal aktif • posisi lebih lama dari 5 menit disembunyikan." : "Belum ada kapal lain yang sedang berbagi lokasi.";
    if (!list) return;
    if (!entries.length) { list.replaceChildren(); return; }
    list.innerHTML = entries.map((entry) => {
      const shortId = entry.id.replace(/-/g, "").slice(-8).toUpperCase();
      const distance = this.lat === null ? "" : " • " + (this.map.distance([this.lat, this.lon], [entry.lat, entry.lon]) / 1852).toFixed(1) + " NM";
      const age = Math.max(0, Math.round((Date.now() - entry.updatedAt) / 1000));
      return "<button type=\"button\" class=\"shared-vessel-row\" data-center-vessel=\"" + this.escapeHTML(entry.id) + "\"><span><b>🚢 " + this.escapeHTML(entry.name) + "</b><small>ID #" + this.escapeHTML(shortId) + distance + "</small></span><time>" + age + " dtk</time></button>";
    }).join("");
    list.querySelectorAll("[data-center-vessel]").forEach((button) => button.addEventListener("click", () => {
      const entry = this.remoteMarkers[button.dataset.centerVessel];
      if (entry) {
        const zoom = Math.max(this.map.getZoom(), 13);
        if (this.is3D && this.map3d) this.map3d.easeTo({ center: [entry.lon, entry.lat], zoom, pitch: 48, duration: 500 });
        else this.map.setView([entry.lat, entry.lon], zoom, { animate: true });
      }
    }));
  },
  toggleLayer(layer, name) {
    if (!layer) return;
    const active = this.map.hasLayer(layer); if (active) this.map.removeLayer(layer); else layer.addTo(this.map);
    const el = document.getElementById("overlayStatus"); if (el) el.textContent = name + (active ? " dimatikan." : " ditampilkan di peta.");
    if (layer === this.windLayer || layer === this.currentLayer) this.sync3DEnvironmentMarkers();
  },
  sync3DEnvironmentMarkers() {
    if (!this.map3d || !this.map3dModule || !this.map3d.isStyleLoaded()) return;
    const update = (key, enabled, data, symbol, offset, label) => {
      if (!enabled || !data || this.lat === null) {
        if (this[key]) this[key].remove();
        this[key] = null;
        return;
      }
      const detail = label(data);
      if (!this[key]) {
        const element = document.createElement("div"); element.className = "maplibre-environment-marker"; element.textContent = symbol; element.setAttribute("role", "img"); element.setAttribute("aria-label", detail);
        const popup = new this.map3dModule.Popup({ offset: 22 }).setText(detail);
        this[key] = new this.map3dModule.Marker({ element, offset }).setLngLat([this.lon, this.lat]).setPopup(popup).addTo(this.map3d);
      } else {
        this[key].setLngLat([this.lon, this.lat]);
        const popup = this[key].getPopup(); if (popup) popup.setText(detail);
      }
    };
    update("map3dWindMarker", this.map.hasLayer(this.windLayer), this.windData, "💨", [-28, -26], (d) => "Angin model: " + d.speed.toFixed(0) + " km/j dari " + Math.round(d.direction) + "°");
    update("map3dCurrentMarker", this.map.hasLayer(this.currentLayer), this.currentData, "🌀", [28, -26], (d) => "Arus model: " + d.speed.toFixed(1) + " km/j menuju " + Math.round(d.direction) + "°" + (d.timestamp ? " • " + d.timestamp : ""));
  },
  queryOverpass(query) {
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 24000);
    return fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query), { cache: "no-store", signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Overpass HTTP " + response.status); return response.json(); })
      .finally(() => clearTimeout(timeout));
  },
  escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  },
  async toggleRain() {
    if (this.rainLayer) return this.toggleLayer(this.rainLayer, "Radar hujan");
    if (this.rainLoading) return;
    this.rainLoading = true;
    const el = document.getElementById("overlayStatus"); if (el) el.textContent = "Mengambil radar hujan global...";
    try {
      const response = await fetch("https://api.rainviewer.com/public/weather-maps.json", { cache: "no-store" });
      if (!response.ok) throw new Error("metadata HTTP " + response.status);
      const data = await response.json();
      const frames = data.radar && data.radar.past || [];
      const latest = frames[frames.length - 1];
      if (!latest || !latest.path) throw new Error("radar kosong");
      const host = String(data.host || "https://tilecache.rainviewer.com").replace(/\/$/, "");
      const url = host + latest.path + "/256/{z}/{x}/{y}/2/1_1.png";
      this.rainLayer = L.tileLayer(url, { opacity: .68, maxZoom: 7, maxNativeZoom: 7, attribution: '<a href="https://www.rainviewer.com/">Radar &copy; RainViewer</a>' }).addTo(this.map);
      this.layers.rain = this.rainLayer;
      if (el) el.textContent = "Radar RainViewer aktif • frame " + new Date(latest.time * 1000).toLocaleTimeString("id-ID") + " • arsip, max zoom 7, personal/edukasi.";
    } catch (_) { if (el) el.textContent = "Radar hujan belum tersedia. Layanan bergantung pada internet dan batas penggunaan RainViewer."; }
    finally { this.rainLoading = false; }
  },
  toggleHazards() {
    if (this.map.hasLayer(this.hazardLayer)) return this.toggleLayer(this.hazardLayer, "Objek karang/kapal karam");
    const el = document.getElementById("overlayStatus"); if (el) el.textContent = "Mencari objek laut terpetakan dalam radius 1 mil laut…";
    const center = this.lat === null ? this.map.getCenter() : { lat: this.lat, lng: this.lon };
    const q = `[out:json][timeout:20];(nwr[natural=reef](around:1852,${center.lat},${center.lng});nwr["seamark:type"~"reef|wreck"](around:1852,${center.lat},${center.lng});nwr[natural~"bare_rock|shallow"](around:1852,${center.lat},${center.lng});nwr[historic=wreck](around:1852,${center.lat},${center.lng}););out center tags;`;
    this.queryOverpass(q).then((d) => {
      this.hazardLayer.clearLayers();
      (d.elements || []).forEach((x) => {
        const p = x.lat !== undefined ? [x.lat, x.lon] : x.center ? [x.center.lat, x.center.lon] : null; if (!p) return;
        const t = x.tags || {}, wreck = t["seamark:type"] === "wreck" || t.historic === "wreck", reef = t.natural === "reef" || t["seamark:type"] === "reef" || !!t["reef:type"];
        const kind = wreck ? "⚓ Kapal karam" : reef ? "🪸 Terumbu/karang terpetakan" : "🪨 Batuan/dangkalan terpetakan";
        const name = this.escapeHTML(t.name || t.description || "Objek terpetakan OpenStreetMap");
        L.marker(p, { icon: L.divIcon({ className: "hazard-marker", html: wreck ? "⚓" : reef ? "🪸" : "🪨", iconSize: [28, 28], iconAnchor: [14, 14] }) }).bindPopup(kind + "<br>" + name + "<br><small>Sumber: OpenStreetMap • radius pencarian 1 NM</small>").addTo(this.hazardLayer);
      });
      this.hazardLayer.addTo(this.map); if (el) el.textContent = (d.elements || []).length + " objek terpetakan di sekitar radius 1 NM. Data OSM dapat tidak lengkap.";
    }).catch(() => { if (el) el.textContent = "Data objek bahaya gagal dimuat. Periksa koneksi lalu coba lagi."; });
  },
  setRoute() {
    if (this.lat === null) return alert("GPS belum aktif. Izinkan lokasi HP terlebih dahulu.");
    const lat = Number(document.getElementById("routeLat").value), lon = Number(document.getElementById("routeLon").value); if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return alert("Isi koordinat tujuan yang valid.");
    const distance = this.map.distance([this.lat, this.lon], [lat, lon]), knots = this.speedKmh > 1 ? this.speedKmh / 1.852 : 6, hours = distance / 1852 / knots, eta = new Date(Date.now() + hours * 3600000);
    if (this.routeLine) this.map.removeLayer(this.routeLine); if (this.destinationMarker) this.map.removeLayer(this.destinationMarker);
    this.routeLine = L.polyline([[this.lat, this.lon], [lat, lon]], { color: "#06d6a0", weight: 5, dashArray: "10 8" }).addTo(this.map); this.destinationMarker = L.marker([lat, lon]).addTo(this.map).bindPopup("🎯 Tujuan kapal<br>Lat " + lat.toFixed(5) + "<br>Lon " + lon.toFixed(5)); this.map.fitBounds(this.routeLine.getBounds(), { padding: [24, 24] });
    const nm=distance/1852, durationHours=nm/knots, durationText=this.formatDuration(durationHours*3600); document.getElementById("routeStatus").innerHTML = "🎯 Jarak garis lurus: <b>" + this.formatDistanceNm(nm) + "</b> • Kecepatan hitung: <b>" + knots.toFixed(1) + " kn</b><br>⏱️ Estimasi waktu tempuh: <b>" + durationText + "</b><br>🕐 Estimasi tiba: <b>" + eta.toLocaleString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) + "</b><br><small>Rute ini garis lurus; belum memperhitungkan alur pelayaran, arus, cuaca, draft, atau hambatan.</small>";
    this.sync3DRoute();
    if (this.map3d) { const bounds = this.routeLine.getBounds(); this.map3d.fitBounds([[bounds.getWest(), bounds.getSouth()], [bounds.getEast(), bounds.getNorth()]], { padding: 60, duration: 600 }); }
  },
  clearRoute() {
    if (this.routeLine) this.map.removeLayer(this.routeLine);
    if (this.destinationMarker) this.map.removeLayer(this.destinationMarker);
    this.routeLine = null; this.destinationMarker = null; this.sync3DRoute();
    const el = document.getElementById("routeStatus"); if (el) el.textContent = "Rute dihapus. Ketuk peta atau isi koordinat tujuan.";
  },
  updateWindOverlay(deg, speed) {
    if (Number.isFinite(Number(speed)) && Number.isFinite(Number(deg))) this.windData = { direction: Number(deg), speed: Number(speed) };
    const summary = document.getElementById("mapWindSummary"); if (summary && Number.isFinite(Number(speed)) && Number.isFinite(Number(deg))) summary.textContent = Number(speed).toFixed(0) + " km/j • " + Math.round(Number(deg)) + "°";
    if (!this.windLayer || this.lat === null) return;
    this.windLayer.clearLayers(); const icon = L.divIcon({ className: "wind-marker", html: "➤", iconSize: [34, 34], iconAnchor: [17, 17] });
    L.marker([this.lat, this.lon], { icon }).addTo(this.windLayer).bindPopup("💨 Angin datang dari " + deg + "° • " + speed + " km/j (model prakiraan)");
    this.sync3DEnvironmentMarkers();
  },
  updateMarineCurrentOverlay(speed, direction, timestamp) {
    const summary = document.getElementById("mapCurrentSummary");
    if (!Number.isFinite(Number(speed)) || !Number.isFinite(Number(direction))) { if (summary) summary.textContent = "tidak tersedia"; return; }
    const velocity = Number(speed), bearing = ((Number(direction) % 360) + 360) % 360;
    this.currentData = { speed: velocity, direction: bearing, timestamp: timestamp ? String(timestamp).slice(0, 40) : "" };
    if (summary) summary.textContent = velocity.toFixed(1) + " km/j • " + Math.round(bearing) + "°";
    if (!this.currentLayer || this.lat === null) return;
    this.currentLayer.clearLayers();
    const icon = L.divIcon({ className: "map-current-arrow", html: "<span style=\"display:block;transform:rotate(" + bearing + "deg)\">➤</span>", iconSize: [34, 34], iconAnchor: [17, 17] });
    const when = timestamp ? "<br><small>Waktu model: " + this.escapeHTML(timestamp) + "</small>" : "";
    this.currentMarker = L.marker([this.lat, this.lon], { icon }).addTo(this.currentLayer).bindPopup("🌀 Arus mengalir menuju " + Math.round(bearing) + "° • " + velocity.toFixed(1) + " km/j" + when + "<br><small>Estimasi model global; bukan pengukuran lokal.</small>");
    this.sync3DEnvironmentMarkers();
  },
  updateStormOverlay(wave, weatherCode) { if (!this.stormLayer || this.lat === null) return; this.stormLayer.clearLayers(); const severe = Number(wave) >= 2.5 || Number(weatherCode) >= 95; if (severe) L.circle([this.lat, this.lon], { radius: 5000, color: "#ef476f", fillColor: "#ef476f", fillOpacity: .16, weight: 3 }).bindPopup("⛈️ Indikasi cuaca/badai berat di sekitar posisi kapal. Periksa BMKG Maritim dan Windy.").addTo(this.stormLayer); },
  autoMarineCheck() {
    if (this.lat === null) return;
    const now = Date.now();
    const last = this.lastMarineCheck;
    const moved = last ? this.map.distance([last.lat, last.lon], [this.lat, this.lon]) : Infinity;
    if (last && now - last.time < 5 * 60 * 1000 && moved < 1000) return;
    this.lastMarineCheck = { lat: this.lat, lon: this.lon, time: now };
    this.cekKedalaman(this.lat, this.lon, true);
    this.deteksiKarang(this.lat, this.lon, true);
  },
  updateWindy(force, overlayOverride) {
    const frame = document.getElementById("windyFrame"); if (!frame) return;
    if (!force && !this.windyLoaded) return;
    this.windyLoaded = true;
    const lat = this.lat === null ? -2.5 : this.lat, lon = this.lon === null ? 118 : this.lon;
    const now = Date.now(), changed = !this.lastWindy || Math.abs(lat - this.lastWindy.lat) > .01 || Math.abs(lon - this.lastWindy.lon) > .01;
    if (!force && (!changed || now - (this.lastWindy && this.lastWindy.time || 0) < 15000)) return;
    const overlay = overlayOverride || "wind"; const params = "lat=" + lat.toFixed(4) + "&lon=" + lon.toFixed(4) + "&detailLat=" + lat.toFixed(4) + "&detailLon=" + lon.toFixed(4) + "&zoom=" + (this.lat === null ? 3 : 8) + "&level=surface&overlay=" + overlay + "&product=ecmwf&menu=true&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=kt&metricTemp=%C2%B0C";
    frame.src = "https://embed.windy.com/embed2.html?" + params; this.lastWindy = { lat, lon, time: now };
  },
  openGoogleMaps() {
    const lat = this.lat === null ? -2.5 : this.lat, lon = this.lon === null ? 118 : this.lon;
    window.open("https://www.google.com/maps/@" + lat.toFixed(6) + "," + lon.toFixed(6) + ",12z", "_blank", "noopener");
  },
  setPosError(msg) { document.getElementById("dashAcc").textContent = msg; document.getElementById("gpsState").textContent = "GNSS belum tersedia"; },
  clearTrack() { if (this.track) this.track.setLatLngs([]); localStorage.removeItem("bs10_track"); } ,
  change3DStyle(style) {
    const allowed = ["bright", "liberty", "positron", "dark", "fiord"];
    if (!allowed.includes(style)) return;
    this.map3dStyle = style;
    localStorage.setItem("bs10_map3d_style", style);
    if (this.is3D) {
      this.is3D = false;
      if (this.map3d) this.map3d.remove();
      this.map3d = null; this.map3dOwnMarker = null; this.map3dRemoteMarkers = {}; this.map3dReefMarkers = []; this.map3dWindMarker = null; this.map3dCurrentMarker = null;
      this.toggle3D();
    }
  },
  async toggle3D() {
    const root = document.getElementById("map"), container = document.getElementById("map3d");
    const button = document.getElementById("btn3D"), mode = document.getElementById("mapMode");
    if (this.is3D) {
      this.is3D = false; root.classList.remove("map-3d"); container.classList.remove("is-active"); container.setAttribute("aria-hidden", "true");
      if (this.map3d) this.map3d.remove();
      this.map3d = null; this.map3dOwnMarker = null; this.map3dRemoteMarkers = {}; this.map3dReefMarkers = []; this.map3dWindMarker = null; this.map3dCurrentMarker = null;
      button.textContent = "🧭 Mode peta 3D"; mode.textContent = "Mode peta 2D aktif";
      setTimeout(() => this.map.invalidateSize(), 250); return;
    }
    if (!navigator.onLine) { alert("Peta 3D perlu koneksi internet. Peta 2D tetap tersedia offline."); return; }
    if (!window.WebGLRenderingContext) { alert("Perangkat ini belum mendukung WebGL untuk peta 3D. Gunakan mode 2D."); return; }
    button.disabled = true; button.textContent = "⏳ Memuat peta 3D…";
    try {
      if (!this.map3dModule) this.map3dModule = await import("https://unpkg.com/maplibre-gl@6.12.0/dist/maplibre-gl.mjs");
      const MapLibre = this.map3dModule;
      this.is3D = true; root.classList.add("map-3d"); container.classList.add("is-active"); container.setAttribute("aria-hidden", "false");
      const center = this.lat === null ? [118, -2.5] : [this.lon, this.lat];
      this.map3d = new MapLibre.Map({
        container,
        style: "https://tiles.openfreemap.org/styles/" + (this.map3dStyle || "bright"),
        center,
        zoom: this.lat === null ? 4 : Math.max(10, this.map.getZoom()),
        pitch: 48,
        bearing: -12,
        maxPitch: 70,
        attributionControl: true,
        cooperativeGestures: true
      });
      if (MapLibre.NavigationControl) this.map3d.addControl(new MapLibre.NavigationControl({ visualizePitch: true }), "top-right");
      this.map3d.on("load", () => {
        try {
          if (!this.map3d.getSource("bs10-openfreemap-buildings")) this.map3d.addSource("bs10-openfreemap-buildings", { type: "vector", url: "https://tiles.openfreemap.org/planet" });
          const building = { id: "bs10-3d-buildings", type: "fill-extrusion", source: "bs10-openfreemap-buildings", "source-layer": "building", minzoom: 14, paint: { "fill-extrusion-color": "#48a9bd", "fill-extrusion-height": ["coalesce", ["get", "render_height"], 5], "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0], "fill-extrusion-opacity": 0.78 } };
          if (!this.map3d.getLayer(building.id)) this.map3d.addLayer(building);
        } catch (_) { /* Bangunan 3D bisa tidak tersedia pada sebagian wilayah/tile. */ }
        this.syncOwnPosition3D();
        Object.values(this.remoteMarkers).forEach((record) => this.syncRemotePosition3D(record));
        this.render3DReefMarkers(); this.sync3DRoute(); this.sync3DEnvironmentMarkers();
        mode.textContent = "3D vektor • bangunan OSM • bukan batimetri/dasar laut";
      });
      this.map3d.on("click", (event) => {
        const lat = document.getElementById("routeLat"), lon = document.getElementById("routeLon");
        if (lat && lon) { lat.value = event.lngLat.lat.toFixed(5); lon.value = event.lngLat.lng.toFixed(5); }
        this.cekKedalaman(event.lngLat.lat, event.lngLat.lng, true);
        this.deteksiKarang(event.lngLat.lat, event.lngLat.lng, true);
      });
      this.map3d.on("error", () => { if (mode) mode.textContent = "3D aktif • sebagian tile vector mungkin belum tersedia"; });
      button.textContent = "🧭 Kembali ke peta 2D";
    } catch (_) {
      this.is3D = false; root.classList.remove("map-3d"); container.classList.remove("is-active"); container.setAttribute("aria-hidden", "true");
      if (this.map3d) this.map3d.remove(); this.map3d = null;
      mode.textContent = "Mode 2D aktif • peta 3D belum dapat dimuat";
      alert("Mode 3D gagal dimuat. Periksa koneksi; peta 2D tetap tersedia.");
      button.textContent = "🧭 Mode peta 3D";
    } finally { button.disabled = false; }
  },
  cekKedalaman(lat, lon, silent) {
    const el = document.getElementById("mapDepth"); el.textContent = "Mengambil kedalaman GEBCO...";
    const url = "https://api.opentopodata.org/v1/gebco2020?locations=" + lat + "," + lon;
    fetch(url, { cache: "no-store" }).then((r) => r.json()).then((d) => {
      const elev = Number(d.results && d.results[0] && d.results[0].elevation);
      if (!Number.isFinite(elev)) throw new Error("depth unavailable");
      const text = elev < 0 ? "🌊 Kedalaman GEBCO: ±" + Math.abs(elev).toFixed(1) + " m" : "⛰️ Titik ini daratan (elevasi " + elev.toFixed(1) + " m)";
      el.textContent = text + " • sumber GEBCO 2020"; document.getElementById("dashDepth").textContent = text;
      if (!silent) L.popup().setLatLng([lat, lon]).setContent(text + "<br><small>Sumber: GEBCO 2020</small>").openOn(this.map);
    }).catch(() => { el.textContent = "Kedalaman belum tersedia. Coba lagi saat online."; document.getElementById("dashDepth").textContent = "Kedalaman: data online gagal dimuat"; });
  },
  deteksiKarang(lat, lon, silent) {
    const el = document.getElementById("reefStatus"); if (el) el.textContent = "Memeriksa data terumbu dan bahaya terpetakan dalam radius 1 NM…";
    const dash = document.getElementById("dashReef"); if (dash) dash.textContent = "Karang sekitar: sedang diperiksa...";
    const q = "[out:json][timeout:20];(nwr[natural=reef](around:1852," + lat + "," + lon + ");nwr[\"seamark:type\"=reef](around:1852," + lat + "," + lon + ");nwr[\"reef:type\"](around:1852," + lat + "," + lon + ");nwr[natural~\"bare_rock|shallow\"](around:1852," + lat + "," + lon + ");nwr[\"seamark:type\"=wreck](around:1852," + lat + "," + lon + ");nwr[historic=wreck](around:1852," + lat + "," + lon + "););out center tags;";
    this.queryOverpass(q).then((d) => {
      this.reefMarkers.forEach((m) => this.map.removeLayer(m)); this.reefMarkers = []; this.reefData = [];
      const range = L.circle([lat, lon], { radius: 1852, color: "#ffcc58", weight: 1, dashArray: "5 7", fillColor: "#ffcc58", fillOpacity: .035, interactive: false }).addTo(this.map); this.reefMarkers.push(range);
      let reefCount = 0, hazardCount = 0, wreckCount = 0;
      (d.elements || []).forEach((x) => {
        const p = x.lat !== undefined ? [x.lat, x.lon] : x.center ? [x.center.lat, x.center.lon] : null; if (!p) return;
        const t = x.tags || {}, wreck = t["seamark:type"] === "wreck" || t.historic === "wreck", reef = t.natural === "reef" || t["seamark:type"] === "reef" || !!t["reef:type"];
        const label = wreck ? "⚓ Kapal karam" : reef ? "🪸 Terumbu/karang terpetakan" : "🪨 Batuan/dangkalan";
        if (wreck) wreckCount++; else if (reef) reefCount++; else hazardCount++;
        const distanceNm = this.map.distance([lat, lon], p) / 1852, rawName = String(t.name || t.description || "Objek OpenStreetMap tanpa nama").slice(0, 120), safeName = this.escapeHTML(rawName);
        const marker = L.circleMarker(p, { radius: reef ? 9 : 8, color: wreck ? "#ff8a65" : reef ? "#ff4d79" : "#ffd166", fillColor: wreck ? "#ff8a65" : reef ? "#ff4d79" : "#ffd166", fillOpacity: .9, weight: 2 }).addTo(this.map)
          .bindPopup("⚠️ " + label + "<br>" + safeName + "<br>Jarak ke titik terpetakan: " + distanceNm.toFixed(2) + " NM<br><small>Sumber: OpenStreetMap. Titik dapat berupa pusat objek, bukan batas tepat.</small>");
        this.reefMarkers.push(marker);
        this.reefData.push({ lat: p[0], lon: p[1], symbol: wreck ? "⚓" : reef ? "🪸" : "🪨", label, name: rawName });
      });
      this.render3DReefMarkers();
      const total = reefCount + hazardCount + wreckCount;
      const summary = total ? "🪸 " + reefCount + " terumbu • 🪨 " + hazardCount + " batu/dangkalan • ⚓ " + wreckCount + " wreck dalam radius 1 NM." : "Tidak ada terumbu/bahaya yang tercatat OSM dalam 1 NM.";
      if (el) el.textContent = summary + " Data peta tidak real-time; hasil kosong bukan jaminan bebas karang.";
      if (dash) dash.textContent = total ? summary : "Tidak ada objek OSM tercatat dalam 1 NM; bukan jaminan bebas karang.";
    }).catch(() => { if (el) el.textContent = "Deteksi perlu internet dan layanan OpenStreetMap. Data tidak tersedia sekarang; gunakan sonar dan peta laut resmi."; if (dash) dash.textContent = "Data terumbu sekitar tidak dapat dimuat."; });
  }
};
