/* Marine OS expansion layer.
 * Provider adapters deliberately contain no proprietary credentials.
 */
const MarineOS = {
  version: "0.1.0-expansion",
  providers: {
    navionics: { enabled: false, status: "Lisensi/SDK belum dikonfigurasi" },
    marineTraffic: { enabled: false, status: "API resmi belum dikonfigurasi" },
    avenzaStyleOffline: { enabled: true, status: "Format offline siap diintegrasikan" },
    radar: { enabled: false, status: "Menunggu gateway/perangkat radar" },
    batnas: { enabled: false, status: "Adapter siap; sumber belum dikonfigurasi" },
    gebco: { enabled: true, status: "GEBCO sudah tersedia di peta saat ini" },
    bmkg: { enabled: true, status: "BMKG digunakan pada modul cuaca saat ini" }
  },
  features: [
    ["sea-map","Sea Map / Nautical Chart","Peta laut, kedalaman, seamarks, hazard dan navigasi."],
    ["ais","AIS / Marine Traffic","Traffic kapal dari provider AIS resmi."],
    ["radar","Marine Radar","Overlay radar dari hardware/gateway yang kompatibel."],
    ["bathymetry","BATNAS / GEBCO","Kedalaman dengan sumber, waktu dan confidence."],
    ["offline-map","Offline Map","GeoPDF, GeoTIFF, MBTiles, GPX, KML/KMZ."],
    ["weather-ocean","Cuaca & Oseanografi","Angin, ombak, hujan, arus, SST dan peringatan."],
    ["fishing","Fishing Intelligence","Indikasi potensi ikan berbasis data, bukan jaminan hasil."],
    ["navigation","Navigation","Waypoint, route, bearing, ETA dan voyage recorder."],
    ["safety","Safety Guardian","SOS, hazard, anchor watch dan CPA/TCPA."],
    ["vessel","Vessel & Fleet","Profil kapal, kru, dokumen, maintenance dan fleet."],
    ["economy","Marine Economy","BBM, harga ikan, biaya trip dan profit/loss."],
    ["social","Marine Social","Follow, Story, vessel search, messaging dan lokasi berbagi."],
    ["ai","Mazkiplay.ai","Marine Copilot multimodal dengan tools terotorisasi."]
  ],
  init() {
    this.renderFeatureRegistry();
    this.bindActions();
    this.refreshTelemetry();
    window.addEventListener("marine:position", () => this.refreshTelemetry());
  },
  renderFeatureRegistry() {
    const el = document.getElementById("marineFeatureGrid");
    if (!el) return;
    el.innerHTML = this.features.map(([id,title,desc]) => {
      const provider = id === "ais" ? this.providers.marineTraffic :
        id === "sea-map" ? this.providers.navionics :
        id === "radar" ? this.providers.radar :
        id === "bathymetry" ? this.providers.gebco : null;
      const status = provider ? provider.status : "Arsitektur tersedia";
      return `<article class="marine-feature-card"><span class="marine-icon">${this.icon(id)}</span><div><b>${this.escape(title)}</b><p>${this.escape(desc)}</p><small>${this.escape(status)}</small></div></article>`;
    }).join("");
  },
  icon(id) {
    return ({ "sea-map":"🗺️", ais:"🚢", radar:"📡", bathymetry:"🌊", "offline-map":"📁", "weather-ocean":"🌦️", fishing:"🐟", navigation:"🧭", safety:"🛟", vessel:"⚓", economy:"💰", social:"👥", ai:"🤖" })[id] || "🌊";
  },
  bindActions() {
    document.getElementById("marineCenterMap")?.addEventListener("click", () => {
      document.querySelector('[data-page="peta"]')?.click();
      setTimeout(() => {
        if (typeof MapApp !== "undefined" && MapApp.lat != null) MapApp.map?.setView([MapApp.lat, MapApp.lon], 13);
      }, 150);
    });
    document.getElementById("marineRefresh")?.addEventListener("click", () => this.refreshTelemetry());
    document.getElementById("marineProviderInfo")?.addEventListener("click", () => this.showProviderInfo());
  },
  refreshTelemetry() {
    const lat = typeof MapApp !== "undefined" ? MapApp.lat : null;
    const lon = typeof MapApp !== "undefined" ? MapApp.lon : null;
    const fix = document.getElementById("marineFix");
    if (fix) fix.textContent = lat == null ? "GNSS menunggu" : lat.toFixed(5) + "°, " + lon.toFixed(5) + "°";
    const speed = document.getElementById("marineSpeed");
    if (speed) {
      const k = typeof MapApp !== "undefined" ? (MapApp.speedKmh || 0) / 1.852 : 0;
      speed.textContent = k.toFixed(1) + " kn";
    }
    const depth = document.getElementById("marineDepth");
    if (depth) depth.textContent = document.getElementById("dashDepth")?.textContent?.replace("Kedalaman: ","") || "—";
    const network = document.getElementById("marineNetwork");
    if (network) network.textContent = navigator.onLine ? "ONLINE" : "OFFLINE";
  },
  showProviderInfo() {
    const rows = Object.entries(this.providers).map(([name,p]) => `<div class="marine-provider-row"><b>${this.escape(name)}</b><span>${this.escape(p.status)}</span></div>`).join("");
    const box = document.getElementById("marineProviderStatus");
    if (box) box.innerHTML = rows;
  },
  escape(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c])); }
};
document.addEventListener("DOMContentLoaded", () => MarineOS.init());
