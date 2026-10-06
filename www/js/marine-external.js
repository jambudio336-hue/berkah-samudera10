/* Marine OS external-data adapters — zero-cost/open-data first. */
(function(){
  "use strict";
  const CFG={
    openMeteoMarine:"https://marine-api.open-meteo.com/v1/marine",
    bmkg:"https://maritim.bmkg.go.id/marine2026-data/",
    gebco:"https://wms.gebco.net/mapserv?",
    osm:"https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    openseamap:"https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
  };
  const cacheKey="bs10_external_cache_v1";
  const read=()=>{try{return JSON.parse(localStorage.getItem(cacheKey)||"{}")}catch(_){return {}}};
  const write=x=>localStorage.setItem(cacheKey,JSON.stringify(x));
  async function json(path,opts={}){
    const r=await fetch(CFG.bmkg+path,{headers:{Accept:"application/json",...(opts.headers||{})},cache:"no-store"});
    if(!r.ok)throw new Error("BMKG HTTP "+r.status);
    return r.json();
  }
  function haversine(a,b){
    const R=6371,rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLon=(b.lon-a.lon)*rad;
    const x=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
  }
  function nearestFeature(fc,lat,lon){
    let best=null;
    (fc?.features||[]).forEach(f=>{
      const g=f.geometry;
      const c=g?.type==="Point"?g.coordinates:null;
      if(!c)return;
      const d=haversine({lat,lon},{lat:c[1],lon:c[0]});
      if(!best||d<best.distanceKm)best={feature:f,distanceKm:d};
    });
    return best;
  }
  async function marineMeta(){
    const c=read(),now=Date.now();
    if(c.meta&&now-c.metaAt<21600000)return c.meta;
    const [areas,ports]=await Promise.all([
      json("meta/area_province.json"),
      json("meta/port_province.json").catch(()=>null)
    ]);
    c.meta={areas,ports};c.metaAt=now;write(c);return c.meta;
  }
  async function marineWeather(lat,lon){
    const meta=await marineMeta();
    const fc=await json("meta/wilmetos.min.geojson");
    let nearest=nearestFeature(fc,lat,lon);
    let code=nearest?.feature?.properties?.code||nearest?.feature?.properties?.kode;
    if(!code){
      const flat=(meta.areas?.data||[]).flatMap(p=>p.areas||[]);
      nearest=flat.map(x=>({x,distanceKm:0}))[0];
      code=nearest?.x?.id;
    }
    if(!code)throw new Error("Wilayah perairan BMKG terdekat tidak ditemukan");
    const data=await json("perairan/"+encodeURIComponent(code)+".json");
    const raw=data?.data||data;
    return {source:"BMKG Data Maritim",code,region:nearest?.feature?.properties?.name||code,distanceKm:nearest?.distanceKm,raw,fetchedAt:new Date().toISOString()};
  }
  async function openMeteoMarine(lat,lon){
    const u=new URL(CFG.openMeteoMarine);
    u.searchParams.set("latitude",lat);u.searchParams.set("longitude",lon);
    u.searchParams.set("hourly","wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,sea_surface_temperature,ocean_current_velocity,ocean_current_direction,sea_level_height_msl");
    u.searchParams.set("forecast_days","7");u.searchParams.set("cell_selection","sea");
    const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error("Open-Meteo Marine HTTP "+r.status);
    const data=await r.json();return {...data,source:"Open-Meteo Marine",fetchedAt:new Date().toISOString()};
  }
  async function warnings(){
    const meta=read();
    if(meta.warning&&Date.now()-meta.warningAt<600000)return meta.warning;
    const index=await json("warning/index.json").catch(()=>null);
    const result={index,source:"BMKG Data Maritim",fetchedAt:new Date().toISOString()};
    meta.warning=result;meta.warningAt=Date.now();write(meta);return result;
  }
  function gebcoGetFeatureInfo(lat,lon,bbox,width=101,height=101){
    const span=0.02,b=[lon-span,lat-span,lon+span,lat+span];
    const qs=new URLSearchParams({SERVICE:"WMS",VERSION:"1.3.0",REQUEST:"GetFeatureInfo",LAYERS:"GEBCO_LATEST_SUB_ICE_TOPO",QUERY_LAYERS:"GEBCO_LATEST_SUB_ICE_TOPO",INFO_FORMAT:"application/json",CRS:"EPSG:4326",BBOX:b.join(","),WIDTH:String(width),HEIGHT:String(height),I:String(Math.floor(width/2)),J:String(Math.floor(height/2))});
    return CFG.gebco+qs.toString();
  }
  async function health(){
    const out={bmkg:null,gebco:null,openMeteoMarine:null,noaaNowCoast:null,osm:null,openseamap:null};
    try{const r=await fetch(CFG.bmkg+"meta/area_province.json",{headers:{Accept:"application/json"},cache:"no-store"});out.bmkg=r.ok}catch(_){out.bmkg=false}
    try{const r=await fetch(CFG.openMeteoMarine+"?latitude=0&longitude=120&hourly=wave_height&forecast_days=1",{cache:"no-store"});out.openMeteoMarine=r.ok}catch(_){out.openMeteoMarine=false}
    try{const r=await fetch(CFG.gebco+"SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",{cache:"no-store"});out.gebco=r.ok}catch(_){out.gebco=false}
    return out;
  }
  const PUBLIC={
    aisStream:"wss://stream.aisstream.io/v0/stream",
    gfw:"https://globalfishingwatch.org/our-apis/",
    noaaAis:"https://marinecadastre.gov/ais/",
    emodnetBathymetry:"https://ows.emodnet-bathymetry.eu/wms?",
    noaaErddap:"https://osmc.noaa.gov/erddap/",
    dataGoId:"https://data.go.id/",
    kkp:"https://portaldata.kkp.go.id/",
    kkpMarket:"https://mi.kkp.go.id/data/",
    kkpPipp:"https://pipp.kkp.go.id/"
  };
  function aisStreamSubscription(boundingBoxes,filters=[]){
    const key=providerConfig().aisStream?.apiKey;
    if(!key)throw new Error("AISStream API key belum dikonfigurasi di server.");
    return {APIKey:key,BoundingBoxes:boundingBoxes,FilterMessageTypes:filters.length?filters:["PositionReport","ShipStaticData","StandardClassBPositionReport"]};
  }
  const providerConfig=()=>window.__MARINE_PROVIDER_CONFIG__||{};
  async function testEndpoint(name){
    const p=providerConfig()[name]||{};
    if(!p.endpoint)return {ok:false,message:"Belum ada endpoint/gateway resmi yang dikonfigurasi."};
    try{
      const r=await fetch(p.endpoint,{method:p.method||"GET",headers:p.headers||{},cache:"no-store"});
      return {ok:r.ok,message:r.ok?"Gateway terjangkau.":"Gateway HTTP "+r.status+"."};
    }catch(e){return {ok:false,message:"Gateway tidak terjangkau: "+(e?.message||"network error")};}
  }
  const integrations={
    ais:{test:()=>testEndpoint("ais")},
    radar:{test:()=>testEndpoint("radar")},
    navionics:{test:async()=>({ok:!!window.NavionicsBridge,message:window.NavionicsBridge?"Native Navionics bridge terdeteksi.":"Menunggu Garmin/Navionics SDK + developer token pada build Android."})},garminActiveCaptain:{test:async()=>window.GarminActiveCaptain?.status?window.GarminActiveCaptain.status():({ok:false,message:"Garmin ActiveCaptain adapter belum dimuat."})},
    marineTraffic:{test:()=>testEndpoint("marineTraffic")},
    windy:{test:()=>testEndpoint("windy")},
    windyMap:{test:async()=>({ok:true,message:"Official Windy map surface siap; API berlisensi dipakai melalui adapter windy saat key/gateway tersedia."})}
  };
  window.MarineExternal={config:CFG,publicSources:PUBLIC,aisStream:{subscription:aisStreamSubscription},bmkg:{json,meta:marineMeta,weather:marineWeather,warnings},marine:{openMeteo:openMeteoMarine},gebco:{getFeatureInfoUrl:gebcoGetFeatureInfo},integrations,providerConfig,health,cache:{read,write}};
})();
