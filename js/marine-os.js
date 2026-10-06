const MarineOS = {
  version: "1.1.0",
  modules: [
    ["sea-map","🗺️","Sea Map / Basemap","Peta layar penuh, pilihan basemap, overlay dan gaya vektor 3D.","peta",true],
    ["navigation","🧭","Navigasi & Perjalanan","GPS, track lokal, bearing dan estimasi rute garis lurus.","peta",true],
    ["ais","🚢","AIS / Marine Traffic","Belum terhubung: memerlukan feed AIS dan izin/API provider resmi.","peta",false],
    ["radar","📡","Marine Radar","Belum terhubung: target radar memerlukan perangkat dan gateway kapal.","peta",false],
    ["bathymetry","🌊","GEBCO Bathymetry","Model kedalaman global indikatif; bukan sounding atau chart navigasi.","peta",true],
    ["weather","🌦️","Weather & Ocean","Prakiraan model angin, gelombang, arus dan cuaca; bukan sensor kapal.","cuaca",true],
    ["fishing","🐟","Catatan Tangkapan","Catat hasil tangkapan lokal; tidak memprediksi hotspot ikan.","tangkapan",true],
    ["hazards","⚠️","Karang & Bahaya Terpetakan","Kueri objek OSM hingga 1 NM; data komunitas, bukan sonar.","peta",true],
    ["safety","🛟","Safety Guardian","Checklist lokal, MOB dan persiapan SOS manual; tidak menghubungi darurat otomatis.","safety",true],
    ["vessel","⚓","Profil Kapal Anonim","ID otomatis tanpa form login; publikasi GPS opsional dan memerlukan persetujuan.","pengaturan",true],
    ["maintenance","🔧","Maintenance Kapal","Belum tersedia pada rilis ini.","pengaturan",false],
    ["documents","📄","Document Vault","Belum tersedia pada rilis ini; jangan mengunggah dokumen pribadi.","pengaturan",false],
    ["economy","💰","BBM & Logistik","Catatan BBM/perbekalan lokal dan kalkulator perjalanan.","perbekalan",true],
    ["social","🛰️","Peta Kapal yang Berbagi","Nama dan ID kapal lain tampil jika pemiliknya opt-in berbagi lokasi.","peta",true],
    ["messenger","💬","Messenger & Calls","Tidak tersedia; aplikasi ini tidak menyediakan chat atau panggilan.","pengaturan",false],
    ["offline","📥","Offline Marine Maps","Belum tersedia; tile provider tidak diunduh/cache untuk offline.","pengaturan",false],
    ["data","📡","Marine Data Contribution","Belum tersedia; belum ada unggahan observasi publik pengguna.","pengaturan",false],
    ["opportunity","🎯","Opportunity Radar","Belum tersedia; aplikasi tidak menyajikan data pasar/peluang prediktif.","riwayat",false],
    ["academy","🎓","Marine Academy","Belum tersedia pada rilis ini.","pengaturan",false],
    ["ai","🤖","Kiplay Voice Assistant","Jawaban AI dapat dibacakan TTS perangkat; model online memerlukan API key pengguna.","kiplay",true],
    ["registry","🧠","AI Feature Registry","Internal/roadmap; belum menjadi fitur pengguna.","pengaturan",false],
    ["camera","📷","Marine Camera","Belum tersedia; kamera berkoordinat belum diimplementasikan.","peta",false],
    ["checklist","✅","Safety Checklist","Checklist keberangkatan tersimpan lokal tanpa akun.","safety",true],
    ["digital-twin","🧩","Digital Twin","Belum tersedia; belum ada telemetri alat/mesin kapal.","pengaturan",false]
  ],
  providers: {
    osm: {name:"OpenStreetMap", enabled:true, mode:"on-demand tiles / ODbL; attribution required; no offline tile cache", env:""},
    openseamap: {name:"OpenSeaMap", enabled:true, mode:"community seamarks overlay; incomplete and not an official chart", env:""},
    gebco: {name:"GEBCO 2026", enabled:true, mode:"public bathymetry model for visualization only; not navigation", env:""},
    bmkg: {name:"BMKG Maritim", enabled:true, mode:"official public API; commercial integration requires permission", env:""},
    overpass: {name:"OpenStreetMap Overpass", enabled:true, mode:"community OSM query service; fair-use/availability applies", env:""},
    rainviewer: {name:"RainViewer", enabled:true, mode:"personal/educational overlay; archive only; rate and zoom limits apply", env:""},
    openMeteoMarine: {name:"Open-Meteo Marine", enabled:true, mode:"free non-commercial marine forecast; CC BY 4.0", env:""},
    noaaNowCoast: {name:"NOAA nowCOAST", enabled:false, mode:"not installed; endpoint/terms unverified and coverage primarily U.S. waters", env:""},
    navionics: {name:"Navionics / Garmin", enabled:false, mode:"official SDK + license", env:"NAVIONICS_DEVELOPER_TOKEN"},
    marineTraffic: {name:"MarineTraffic / Kpler", enabled:false, mode:"official API + license", env:"MARINETRAFFIC_API_KEY"},
    radar: {name:"Onboard Marine Radar", enabled:false, mode:"hardware gateway", env:"RADAR_GATEWAY_URL"},
    batnas: {name:"BATNAS", enabled:false, mode:"authorized dataset/access required", env:"BATNAS_ENDPOINT"},
    ai: {name:"Jarvis / OpenRouter", enabled:true, mode:"user-configured free router", env:"OPENROUTER_API_KEY"}
  },
  worldIntegrations: [
    {id:"ais-live",icon:"🚢",name:"AIS Realtime / MarineTraffic → Kpler",kind:"AIS",status:"LICENSE / API",detail:"Real-time vessel positions, static data, history and live stream when an authorized Kpler/MarineTraffic feed is connected.",action:"https://www.kpler.com/product/maritime/data-services",adapter:"MarineExternal.integrations.ais"},
    {id:"radar-hw",icon:"📡",name:"Marine Radar Hardware",kind:"RADAR",status:"HARDWARE",detail:"Real radar targets/PPI require an onboard radar plus a supported network/gateway. The app never invents radar targets.",action:"https://www.garmin.com/en-US/marine/",adapter:"MarineExternal.integrations.radar"},
    {id:"navionics",icon:"🗺️",name:"Navionics / Garmin Charts",kind:"CHARTS",status:"LICENSE / SDK",detail:"Navionics nautical charts, HD bathymetry, tides/currents and chart objects through Garmin's authorized Mobile SDK.",action:"https://developer.garmin.com/marine-charts/mobile/",adapter:"MarineExternal.integrations.navionics"},
    {id:"garmin-activecaptain",icon:"⚓",name:"Garmin ActiveCaptain Community",kind:"GARMIN COMMUNITY",status:"FREE SDK / KEY",detail:"Garmin's Apache-2.0 open-source Android SDK for ActiveCaptain Community POIs/reviews. Developer access and Stage API key are still required for live community data.",action:"https://developer.garmin.com/active-captain/mobile/",adapter:"MarineExternal.integrations.garminActiveCaptain"},
    {id:"marinetraffic",icon:"🌐",name:"MarineTraffic API",kind:"MARINETRAFFIC",status:"API KEY / PLAN",detail:"Dedicated MarineTraffic API services can be connected for authorized AIS and vessel-data use cases.",action:"https://servicedocs.marinetraffic.com/",adapter:"MarineExternal.integrations.marineTraffic"},
    {id:"windy-api",icon:"🌬️",name:"Windy API",kind:"WINDY",status:"LICENSE / API KEY",detail:"Official Windy API connector for forecast/map services. The public Windy map remains available separately.",action:"https://api.windy.com/",adapter:"MarineExternal.integrations.windy"},
    {id:"windy-map",icon:"🌀",name:"Windy Map / Full Web Experience",kind:"WINDY MAP",status:"WEB / TERMS",detail:"Official Windy map surface with layer switching, timeline and global visualization; full API parity is subject to Windy terms.",action:"https://www.windy.com/",adapter:"MarineExternal.integrations.windyMap"}
  ],
  init() {
    this.renderDashboard();
    this.renderWorldIntegrations();
    this.renderPublicSources();
    this.bind();
    this.refreshTelemetry();
    setInterval(()=>this.refreshTelemetry(),5000);
    window.addEventListener("marine:position",()=>this.refreshTelemetry());
  },
  renderDashboard() {
    const grid=document.getElementById("marineModuleGrid"); if(!grid)return;
    const available=this.modules.filter((item)=>item[5]).length;
    const count=document.getElementById("marineModuleCount"); if(count)count.textContent=available+" aktif • "+(this.modules.length-available)+" belum tersedia";
    grid.innerHTML=this.modules.map(([id,icon,title,desc,target,active])=>'<button class="marine-module" '+(active?'data-marine-target="'+this.esc(target)+'"':'disabled aria-disabled="true"')+'><span>'+icon+'</span><div><b>'+this.esc(title)+'</b><small>'+this.esc(desc)+'</small><em class="marine-module-status '+(active?'is-active':'')+'">'+(active?'TERSEDIA':'BELUM TERSEDIA')+'</em></div></button>').join("");
  },
  bind() {
    document.getElementById("marineModuleGrid")?.addEventListener("click",e=>{const b=e.target.closest("[data-marine-target]"); if(b)this.go(b.dataset.marineTarget);});
    document.getElementById("marineCenterMap")?.addEventListener("click",()=>this.go("peta"));
    document.getElementById("marineOpenWeather")?.addEventListener("click",()=>this.go("cuaca"));
    document.getElementById("marineOpenAccount")?.addEventListener("click",()=>this.go("pengaturan"));
    document.getElementById("marineOpenSettings")?.addEventListener("click",()=>this.go("pengaturan"));
    document.getElementById("marineOpenSafety")?.addEventListener("click",()=>this.go("pengaturan"));
    document.getElementById("marineOpenAI")?.addEventListener("click",()=>this.go("pengaturan"));
    document.getElementById("marineOpenJarvis")?.addEventListener("click",()=>this.go("pengaturan"));
    document.getElementById("marineProviderInfo")?.addEventListener("click",()=>this.showProviders());
    document.getElementById("marineRefresh")?.addEventListener("click",()=>this.refreshTelemetry());
    this.bindWorldIntegrations();
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
  renderPublicSources(){
    const box=document.getElementById("marinePublicSources"); if(!box)return;
    const s=window.MarineExternal?.publicSources||{};
    const rows=[
      ["aisStream","🚢","AISStream Realtime AIS","LIVE*","WebSocket AIS realtime; key server-side."],
      ["gfw","🐟","Global Fishing Watch","DYNAMIC","Vessel activity, identity/history, fishing effort."],
      ["noaaAis","🛰️","NOAA MarineCadastre AIS","HISTORICAL","Public U.S. AIS traffic archive."],
      ["emodnetBathymetry","🌊","EMODnet Bathymetry","OPEN","OGC bathymetry services."],
      ["noaaErddap","🌡️","NOAA ERDDAP","OBSERVATION","Oceanographic datasets, freshness varies."],
      ["dataGoId","🇮🇩","data.go.id","PUBLIC","Indonesia government open datasets."],
      ["kkp","🎣","KKP Portal Data","PUBLIC","WPP/fisheries and maritime datasets."]
    ];
    box.innerHTML=rows.map(x=>`<article class="marine-world-card"><div class="marine-world-top"><span class="marine-world-icon">${x[1]}</span><div><b>${x[2]}</b><small>${x[3]}</small></div></div><p>${x[4]}</p><a class="btn sm" href="${this.esc(s[x[0]]||"#")}" target="_blank" rel="noopener noreferrer">↗ Sumber publik</a></article>`).join("");
  },
  renderWorldIntegrations(){
    const box=document.getElementById("marineWorldIntegrations"); if(!box)return;
    box.innerHTML=this.worldIntegrations.map(p=>`
      <article class="marine-world-card" data-world-provider="${this.esc(p.id)}">
        <div class="marine-world-top"><span class="marine-world-icon">${p.icon}</span><div><b>${this.esc(p.name)}</b><small>${this.esc(p.kind)}</small></div><span class="marine-world-status">${this.esc(p.status)}</span></div>
        <p>${this.esc(p.detail)}</p>
        <div class="marine-world-actions"><button class="btn sm" data-world-test="${this.esc(p.id)}">🔌 Cek konektor</button><a class="btn sm" href="${this.esc(p.action)}" target="_blank" rel="noopener noreferrer">↗ Dokumentasi / akses</a></div>
        <div class="marine-world-result muted" data-world-result>${this.esc(p.adapter)}</div>
      </article>`).join("");
  },
  bindWorldIntegrations(){
    document.getElementById("marineWorldIntegrations")?.addEventListener("click",async e=>{
      const b=e.target.closest("[data-world-test]"); if(!b)return;
      const card=b.closest("[data-world-provider]"), out=card?.querySelector("[data-world-result]"), id=b.dataset.worldTest;
      b.disabled=true; b.textContent="⏳ Mengecek...";
      try{
        const provider={"ais-live":"ais","radar-hw":"radar","navionics":"navionics","marinetraffic":"marineTraffic","windy-api":"windy","windy-map":"windyMap"}[id]; const fn=provider?window.MarineExternal?.integrations?.[provider]:null;
        if(id==="windy-map"){out.textContent="🟢 Windy map surface tersedia melalui iframe resmi; API penuh tetap memerlukan izin/key.";return;}
        if(fn&&typeof fn.test==="function"){const x=await fn.test();out.textContent=(x.ok?"🟢 ":"🟡 ")+(x.message||"Adapter siap.");}
        else out.textContent="🟡 Adapter sudah disiapkan. Hubungkan credential/gateway resmi untuk data live.";
      }catch(err){out.textContent="🔴 "+(err?.message||"Koneksi gagal.");}
      finally{b.disabled=false;b.textContent="🔌 Cek konektor";}
    });
  },
  showProviders(){
    const box=document.getElementById("marineProviderStatus");if(!box)return;
    box.innerHTML=Object.values(this.providers).map(p=>'<div class="marine-provider-row"><b>'+this.esc(p.name)+'</b><span>'+(p.enabled?"🟢 Aktif":"🟡 Belum terhubung")+" • "+this.esc(p.mode)+(p.env?" • "+this.esc(p.env):"")+"</span></div>").join("");
    if(window.MarineExternal?.health){MarineExternal.health().then(h=>{const labels={bmkg:"BMKG",gebco:"GEBCO",openMeteoMarine:"Open-Meteo"};Object.keys(labels).forEach(k=>{const row=[...box.querySelectorAll(".marine-provider-row")].find(x=>x.textContent.includes(labels[k]));if(row){const span=row.querySelector("span");if(span){const reach=h[k]===true?"🟢 Reachable":h[k]===false?"🔴 Unreachable":"ℹ️ On-demand • belum diuji";span.textContent=reach+" • "+span.textContent.replace(/^.*? • /,"")}}})}).catch(()=>{});}
  },
  esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
};
document.addEventListener("DOMContentLoaded",()=>MarineOS.init());
