const Weather = {
  lastKey: "",
  init() {
    const p = Weather.pos();
    const q = "latitude=" + p.lat + "&longitude=" + p.lon;
    Weather.muatCuaca(q);
    Weather.muatMarine(q);
    Weather.muatBMKG();
    setInterval(Weather.muatBMKG, 15 * 60 * 1000);
    const btn = document.getElementById("btnRefreshBMKG"); if (btn) btn.addEventListener("click", Weather.muatBMKG);
  },

  refreshPosition(lat, lon) {
    const key = lat.toFixed(2) + "," + lon.toFixed(2);
    if (key === Weather.lastKey) return;
    Weather.lastKey = key;
    const q = "latitude=" + lat + "&longitude=" + lon;
    Weather.muatCuaca(q); Weather.muatMarine(q);
  },
  pos() {
    try {
      const p = JSON.parse(localStorage.getItem("bs10_lastpos"));
      return p || { lat: -2.5, lon: 118 };
    } catch (e) { return { lat: -2.5, lon: 118 }; }
  },

  muatCuaca(q) {
    fetch("https://api.open-meteo.com/v1/forecast?" + q +
      "&current=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum" +
      "&forecast_days=4&timezone=auto")
      .then((r) => r.json())
      .then((d) => Weather.tampilCuaca(d))
      .catch(() => {
        document.getElementById("weatherNow").textContent = "Offline: data cuaca tidak tersedia.";
      });
  },

  muatMarine(q) {
    fetch("https://marine-api.open-meteo.com/v1/marine?" + q +
      "&current=wave_height,wave_direction,wave_period,wind_wave_height,sea_surface_temperature" +
      "&timezone=auto")
      .then((r) => r.json())
      .then((d) => Weather.tampilMarine(d))
      .catch(() => {
        document.getElementById("marineNow").textContent = "Offline: data ombak tidak tersedia.";
      });
  },

  tampilCuaca(d) {
    const c = d.current;
    Weather.lastWeatherCode = c.weather_code;
    const desk = Weather.deskCuaca(c.weather_code);
    const arah = Weather.arahAngin(c.wind_direction_10m);
    const html = "<p class='big'>" + desk + "</p>" +
      "<p>🌡️ Suhu: <b>" + c.temperature_2m + " °C</b></p>" +
      "<p>💨 Angin: <b>" + c.wind_speed_10m + " km/j</b> dari " + arah + "</p>" +
      "<p>🌧️ Curah hujan: <b>" + c.precipitation + " mm</b></p>";
    document.getElementById("weatherNow").innerHTML = html;
    document.getElementById("dashWeather").innerHTML = desk + " • " + c.temperature_2m + "°C • Angin " + c.wind_speed_10m + " km/j dari " + arah;
    if (typeof MapApp !== "undefined") { MapApp.updateWindOverlay(c.wind_direction_10m, c.wind_speed_10m); MapApp.updateStormOverlay(null, c.weather_code); }
    const sea = document.getElementById("mapSeaTelemetry"); if (sea) sea.textContent = "Suhu " + c.temperature_2m + "°C • Angin " + c.wind_speed_10m + " km/j dari " + arah;

    let alarm = [];
    if (c.wind_speed_10m >= 40) alarm.push("Angin kencang " + c.wind_speed_10m + " km/j");
    if (c.precipitation >= 5) alarm.push("Hujan lebat terdeteksi");
    Weather.pasangAlarm(alarm);

    let rows = "";
    for (let i = 0; i < d.daily.time.length; i++) {
      rows += "<div class='row forecast-row'>" +
        "<span><b>" + new Date(d.daily.time[i]).toLocaleDateString("id-ID", { weekday: "long" }) + "</b></span>" +
        "<span>" + Weather.deskCuaca(d.daily.weather_code[i]) + "</span>" +
        "<span>" + d.daily.temperature_2m_min[i] + "–" + d.daily.temperature_2m_max[i] + "°C</span>" +
        "<span>💨" + d.daily.wind_speed_10m_max[i] + "</span>" +
        "<span>🌧️" + d.daily.precipitation_sum[i] + "mm</span></div>";
    }
    document.getElementById("forecast").innerHTML = rows;
  },

  tampilMarine(d) {
    const c = d.current;
    if (typeof MapApp !== "undefined") MapApp.updateStormOverlay(c.wave_height, Weather.lastWeatherCode);
    const html = "<p>🌊 Tinggi ombak: <b>" + c.wave_height + " m</b></p>" +
      "<p>🧭 Arah ombak: <b>" + Weather.arahAngin(c.wave_direction) + "</b></p>" +
      "<p>⏱️ Periode ombak: <b>" + c.wave_period + " s</b></p>" +
      "<p>🌀 Ombak angin: <b>" + c.wind_wave_height + " m</b></p>" +
      "<p>🌡️ Suhu laut: <b>" + c.sea_surface_temperature + " °C</b></p>";
    document.getElementById("marineNow").innerHTML = html;
    document.getElementById("dashWave").innerHTML = "Ombak " + c.wave_height + " m • Periode " + c.wave_period + " s • arah " + Weather.arahAngin(c.wave_direction);
    const area = document.getElementById("dashWaveArea"); if (area) { const p = Weather.pos(); area.textContent = "Area ombak: sekitar " + Number(p.lat).toFixed(3) + "°, " + Number(p.lon).toFixed(3) + "° (posisi kapal)"; }
    let alarm = [];
    if (c.wave_height >= 2.5) alarm.push("Ombak tinggi " + c.wave_height + " m — WASPADA!");
    else if (c.wave_height >= 1.5) alarm.push("Ombak sedang-tinggi " + c.wave_height + " m");
    Weather.pasangAlarm(alarm);
  },

  pasangAlarm(daftar) {
    const el = document.getElementById("alertBanner");
    if (daftar.length === 0) { el.classList.add("hidden"); return; }
    el.innerHTML = "⚠️ PERINGATAN CUACA EKSTREM: " + daftar.join(" • ") +
      " — Disarankan tidak melaut jauh!";
    el.classList.remove("hidden");
  },

  muatBMKG() {
    const el = document.getElementById("bmkgNews");
    if (!el) return;
    const updated = new Date().toLocaleString("id-ID");
    el.innerHTML = "<p class='muted'>Menghubungi kanal resmi BMKG Maritim...</p>";
    const sources = [
      { title: "Peringatan Gelombang Tinggi", url: "https://maritim.bmkg.go.id/cuaca/peringatan/gelombang", tag: "Gelombang & wilayah terdampak" },
      { title: "Bulletin Cuaca untuk Pelayaran", url: "https://maritim.bmkg.go.id/cuaca/bulletin", tag: "Angin, laut, dan sinoptik" },
      { title: "Prakiraan Cuaca Maritim", url: "https://maritim.bmkg.go.id/", tag: "Perairan Indonesia" }
    ];
    Promise.allSettled(sources.map((x) => fetch(x.url, { cache: "no-store", mode: "cors" }).then((r) => ({ ok: r.ok, text: r.text() }))))
      .then((results) => {
        const online = results.some((r) => r.status === "fulfilled" && r.value.ok);
        const status = online ? "🟢 Kanal BMKG Maritim terhubung" : "🟡 Pratinjau offline — buka tautan resmi untuk data terbaru";
        el.innerHTML = "<p><b>" + status + "</b></p>" + sources.map((x) => "<a class='news-link' href='" + x.url + "' target='_blank' rel='noopener noreferrer'><strong>" + x.title + "</strong><span>" + x.tag + " ↗</span></a>").join("") + "<p class='muted news-updated'>Pembaruan kanal: " + updated + " • Data peringatan tetap mengikuti halaman resmi BMKG.</p>";
      }).catch(() => {
        el.innerHTML = "<p><b>🟡 BMKG Maritim belum dapat dihubungi</b></p>" + sources.map((x) => "<a class='news-link' href='" + x.url + "' target='_blank' rel='noopener noreferrer'><strong>" + x.title + "</strong><span>Buka sumber resmi ↗</span></a>").join("") + "<p class='muted news-updated'>Periksa koneksi internet dan refresh kembali.</p>";
      });
  },
  deskCuaca(code) {
    const peta = {
      0: "☀️ Cerah", 1: "🌤️ Cerah Berawan", 2: "⛅ Berawan Sebagian",
      3: "☁️ Berawan", 45: "🌫️ Berkabut", 48: "🌫️ Kabut Beku",
      51: "🌦️ Gerimis Ringan", 53: "🌦️ Gerimis", 55: "🌧️ Gerimis Lebat",
      61: "🌧️ Hujan Ringan", 63: "🌧️ Hujan", 65: "⛈️ Hujan Lebat",
      80: "🌦️ Hujan Lokal", 81: "🌧️ Hujan Deras", 82: "⛈️ Hujan Sangat Deras",
      95: "⛈️ Badai Petir", 96: "⛈️ Badai Petir + Es", 99: "⛈️ Badai Hebat"
    };
    return peta[code] || "Cuaca: kode " + code;
  },

  arahAngin(deg) {
    const arah = ["Utara","Timur Laut","Timur","Tenggara","Selatan",
      "Barat Daya","Barat","Barat Laut"];
    return arah[Math.round(deg / 45) % 8];
  }
};
