const MapApp = {
  map: null,
  marker: null,
  lat: null,
  lon: null,
  watchId: null,

  init() {
    this.map = L.map("map").setView([-2.5, 118], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(this.map);
    this.map.on("click", (e) => this.cekKedalaman(e.target, e.latlng.lat, e.latlng.lng));

    document.getElementById("btnCenter").addEventListener("click", () => {
      if (this.lat !== null) this.map.setView([this.lat, this.lon], 14);
      else alert("GPS belum aktif. Nyalakan lokasi di HP.");
    });
    document.getElementById("btnDepth").addEventListener("click", () => {
      if (this.lat !== null) this.cekKedalaman(this.map, this.lat, this.lon);
      else alert("GPS belum aktif.");
    });
    this.startGPS();
  },

  startGPS() {
    if (!navigator.geolocation) {
      this.setPosError("Perangkat tidak mendukung GPS.");
      return;
    }
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.onPos(pos),
      () => this.setPosError("GPS tidak dapat diakses. Izinkan lokasi."),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
  },

  onPos(pos) {
    this.lat = pos.coords.latitude;
    this.lon = pos.coords.longitude;
    const acc = Math.round(pos.coords.accuracy);
    const teksLat = this.lat.toFixed(5) + "°";
    const teksLon = this.lon.toFixed(5) + "°";
    document.getElementById("mapLat").textContent = teksLat;
    document.getElementById("mapLon").textContent = teksLon;
    document.getElementById("dashLat").textContent = "Latitude: " + teksLat;
    document.getElementById("dashLon").textContent = "Longitude: " + teksLon;
    document.getElementById("dashAcc").textContent = "Akurasi: " + acc + " m";
    if (!this.marker) {
      this.marker = L.marker([this.lat, this.lon]).addTo(this.map);
      this.map.setView([this.lat, this.lon], 13);
    } else {
      this.marker.setLatLng([this.lat, this.lon]);
    }
    this.marker.bindPopup("Lokasi Kapal Saya<br>Lat " + teksLat + "<br>Lon " + teksLon);
    localStorage.setItem("bs10_lastpos", JSON.stringify({ lat: this.lat, lon: this.lon }));
  },

  setPosError(msg) {
    document.getElementById("dashAcc").textContent = msg;
  },

  cekKedalaman(map, lat, lon) {
    const el = document.getElementById("mapDepth");
    el.textContent = "Mengukur kedalaman...";
    fetch("https://api.open-meteo.com/v1/elevation?latitude=" + lat +
        "&longitude=" + lon)
      .then((r) => r.json())
      .then((d) => {
        const elev = d.elevation[0];
        if (elev < 0) {
          el.textContent = "🌊 Kedalaman laut di titik ini: ±" +
            Math.abs(elev).toFixed(1) + " meter";
        } else {
          el.textContent = "⛰️ Titik ini daratan (elevasi " + elev + " m)";
        }
        L.popup().setLatLng([lat, lon])
          .setContent(el.textContent).openOn(map);
      })
      .catch(() => { el.textContent = "Gagal mengukur. Butuh koneksi internet."; });
  }
};
