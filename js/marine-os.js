const MarineOS = {
  version: "0.3.0",
  modules: [
    ["sea-map","🗺️","Sea Map / Nautical Chart","Peta laut, nautical layers, seamarks, depth contours, satellite & night mode.","peta"],
    ["navigation","🧭","Navigation & Voyage","Route, waypoint, bearing, NM/km, ETA, track replay, voyage log & anchor watch.","peta"],
    ["ais","🚢","AIS / Marine Traffic","Traffic kapal, vessel search, MMSI/IMO, SOG/COG, CPA/TCPA bila provider tersedia.","peta"],
    ["radar","📡","Marine Radar","Radar PPI dan target overlay dari perangkat/gateway radar yang kompatibel.","peta"],
    ["bathymetry","🌊","BATNAS + GEBCO","Kedalaman, contour, sounding, sumber, resolusi dan confidence.","peta"],
    ["weather","🌦️","Weather & Ocean","Angin, gelombang, arus, SST, prakiraan dan BMKG maritime warnings.","cuaca"],
    ["fishing","🐟","Fishing Intelligence","Indikasi area potensial berdasarkan SST, depth, currents, weather & observations.","tangkapan"],
    ["hazards","⚠️","Hazards & Wrecks","Reef, rock, shoal, wreck, restricted areas dan navigational aids.","peta"],
    ["safety","🛟","Safety Guardian","SOS, MAYDAY/PAN-PAN assistant, hazard alert, connectivity & anchor watch.","pengaturan"],
    ["vessel","⚓","Vessel & Fleet","Profil kapal, crew, fleet, cargo, manifest, vessel status dan permissions.","akun"],
    ["maintenance","🔧","Maintenance","Engine hours, maintenance schedule, service history dan reminders.","pengaturan"],
    ["documents","📄","Document Vault","Dokumen kapal/kru, expiry tracking dan reminder.","pengaturan"],
    ["economy","💰","Marine Economy","Fuel, logistics, fish prices, trip cost, revenue dan profit/loss.","riwayat"],
    ["social","👥","Marine Social","Follow, vessel search, posts, Story, activity, location sharing & notifications.","akun"],
    ["messenger","💬","Messenger & Calls","Private/group chat, files, voice messages, voice/video calls.","akun"],
    ["offline","📥","Offline Marine Maps","GeoPDF, GeoTIFF, MBTiles, GPX, KML/KMZ dan cached marine data.","peta"],
    ["data","📡","Marine Data Contribution","User observations, hazards, photos, timestamp, source & confidence.","peta"],
    ["opportunity","🎯","Opportunity Radar","Fishing, port, logistics, market and trip opportunities.","riwayat"],
    ["academy","🎓","Marine Academy","Materi navigasi, safety, weather, fishing and operational learning.","pengaturan"],
    ["ai","🤖","Mazkiplay.ai","Marine Copilot multimodal: text, image, file, voice and authorized app tools.","pengaturan"],
    ["registry","🧠","AI Feature Registry","Capability registry + versioned manifest agar AI memahami fitur baru.","pengaturan"],
    ["camera","📷","Marine Camera","Foto dengan koordinat, waktu dan metadata perjalanan.","peta"],
    ["checklist","✅","Smart Checklist","Pre-departure, underway, arrival, post-trip and emergency checklist.","pengaturan"],
    ["digital-twin","🧩","Digital Twin","Status digital kapal, equipment, trips, maintenance and operational context.","akun"]
  ],
  providers: {
    osm: {name:"OpenStreetMap", enabled:true, mode:"open data / ODbL; tile service terms apply", env:""},
    openseamap: {name:"OpenSeaMap", enabled:true, mode:"open marine data / ODbL + chart tile license", env:""},
    gebco: {name:"GEBCO 2026", enabled:true, mode:"official public WMS / open bathymetry", env:""},
    bmkg: {name:"BMKG Maritim", enabled:true, mode:"official public API; commercial integration requires permission", env:""},
    carto: {name:"CARTO", enabled:true, mode:"public map tiles subject to provider terms", env:""},
    navionics: {name:"Navionics / Garmin", enabled:false, mode:"official SDK + license", env:"NAVIONICS_DEVELOPER_TOKEN"},
    marineTraffic: {name:"MarineTraffic / Kpler", enabled:false, mode:"official API + license", env:"MARINETRAFFIC_API_KEY"},
    radar: {name:"Onboard Marine Radar", enabled:false, mode:"hardware gateway", env:"RADAR_GATEWAY_URL"},
    batnas: {name:"BATNAS", enabled:false, mode:"authorized dataset/access required", env:"BATNAS_ENDPOINT"},
    ai: {name:"Mazkiplay.ai / OpenAI", enabled:false, mode:"user key or server gateway", env:"OPENAI_API_KEY"}
  },
  init() {
    this.renderDashboard();
    this.bind();
    this.refreshTelemetry();
    setInterval(()=>this.refreshTelemetry(),5000);
    window.addEventListener("marine:position",()=>this.refreshTelemetry());
  },
  renderDashboard() {
    const grid=document.getElementById("marineModuleGrid"); if(!grid)return;
    grid.innerHTML=this.modules.map(([id,icon,title,desc,target])=>'<button class="marine-module" data-marine-target="'+this.esc(target)+'"><span>'+icon+'</span><div><b>'+this.esc(title)+'</b><small>'+this.esc(desc)+'</small></div></button>').join("");
  },
  bind() {
    document.getElementById("marineModuleGrid")?.addEventListener("click",e=>{const b=e.target.closest("[data-marine-target]"); if(b)this.go(b.dataset.marineTarget);});
    document.getElementById("marineCenterMap")?.addEventListener("click",()=>this.go("peta"));
    document.getElementById("marineOpenWeather")?.addEventListener("click",()=>this.go("cuaca"));
    document.getElementById("marineOpenAccount")?.addEventListener("click",()=>this.go("akun"));
    document.getElementById("marineOpenSettings")?.addEventListener("click",()=>this.go("pengaturan"));
    document.getElementById("marineOpenSafety")?.addEventListener("click",()=>this.go("pengaturan"));
    document.getElementById("marineOpenAI")?.addEventListener("click",()=>this.go("pengaturan"));
    document.getElementById("marineProviderInfo")?.addEventListener("click",()=>this.showProviders());
    document.getElementById("marineRefresh")?.addEventListener("click",()=>this.refreshTelemetry());
  },
  go(page) {
    const tab=document.querySelector('.tab[data-page="'+page+'"]'); if(tab) tab.click();
    setTimeout(()=>{if(page==="peta"&&window.MapApp?.map)MapApp.map.invalidateSize();},250);
  },
  refreshTelemetry() {
    const m=window.MapApp, lat=m?.lat, lon=m?.lon;
    const fix=document.getElementById("marineFix"), speed=document.getElementById("marineSpeed"), depth=document.getElementById("marineDepth"), net=document.getElementById("marineNetwork"), heading=document.getElementById("marineHeading");
    if(fix)fix.textContent=Number.isFinite(lat)&&Number.isFinite(lon)?lat.toFixed(5)+"°, "+lon.toFixed(5)+"°":"Menunggu GNSS";
    if(speed){const k=Number(m?.speedKmh||0)/1.852;speed.textContent=k.toFixed(1)+" kn";}
    if(depth)depth.textContent=document.getElementById("dashDepth")?.textContent?.replace("Kedalaman: ","")||"—";
    if(heading)heading.textContent=Number.isFinite(m?.heading)?Math.round(m.heading)+"°":"—";
    if(net)net.textContent=navigator.onLine?"ONLINE":"OFFLINE";
  },
  showProviders(){
    const box=document.getElementById("marineProviderStatus");if(!box)return;
    box.innerHTML=Object.values(this.providers).map(p=>'<div class="marine-provider-row"><b>'+this.esc(p.name)+'</b><span>'+(p.enabled?"🟢 Aktif":"🟡 Belum terhubung")+" • "+this.esc(p.mode)+(p.env?" • "+this.esc(p.env):"")+"</span></div>").join("");
  },
  esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
};
document.addEventListener("DOMContentLoaded",()=>MarineOS.init());