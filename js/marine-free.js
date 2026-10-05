/* Marine OS — Zero-Cost Core
 * Local/open-data-first implementations. No premium API credentials are required.
 * Premium providers can be plugged in later without changing module contracts.
 */
(function(){
  "use strict";
  const KEY="marine_os_free_core_v1";
  const state=JSON.parse(localStorage.getItem(KEY)||'{"waypoints":[],"routes":[],"tracks":[],"hazards":[],"observations":[],"checklists":[],"maintenance":[],"documents":[],"expenses":[],"catchLogs":[],"messages":[],"settings":{"offlineMode":true}}');
  function save(){ localStorage.setItem(KEY,JSON.stringify(state)); }
  function uid(p){ return p+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7); }
  function rad(x){return x*Math.PI/180;}
  function distanceNm(a,b){const R=3440.065,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon),x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
  function bearing(a,b){const y=Math.sin(rad(b.lon-a.lon))*Math.cos(rad(b.lat));const x=Math.cos(rad(a.lat))*Math.sin(rad(b.lat))-Math.sin(rad(a.lat))*Math.cos(rad(b.lat))*Math.cos(rad(b.lon-a.lon));return (Math.atan2(y,x)*180/Math.PI+360)%360;}
  function etaHours(nm,sog){return sog>0?nm/sog:null;}
  const capabilities=[
    ["sea-map","Peta laut","OSM + OpenSeaMap + GEBCO","local/open-data"],
    ["navigation","Navigasi & rute","GPS + geodesic engine","local"],
    ["ais","AIS","adapter/provider interface; no fabricated targets","provider-optional"],
    ["radar","Radar","simulator/overlay; hardware gateway optional","local/optional"],
    ["bathymetry","Batimetri","GEBCO 2026 WMS","open-data"],
    ["weather","Cuaca laut","BMKG Maritime API","public-api"],
    ["fishing","Fishing intelligence","SST/depth/current/weather + observations","derived"],
    ["hazards","Hazard / wreck / reef","OSM/OpenSeaMap + user reports","open/community"],
    ["safety","Safety Guardian","local rules + GPS + weather/hazard inputs","local"],
    ["vessel","Vessel profile","local storage","local"],
    ["maintenance","Maintenance","local logbook","local"],
    ["documents","Document Vault","local files/metadata","local"],
    ["economy","Trip economics","local calculator","local"],
    ["social","Social","local-first records; online sync optional","local/optional"],
    ["messenger","Messenger","local drafts/queue; online transport optional","local/optional"],
    ["offline","Offline mode","local storage + permitted caches","local"],
    ["data","Marine observations","local contribution queue","local"],
    ["opportunity","Opportunity radar","derived from available datasets","derived"],
    ["academy","Marine Academy","bundled lessons","local"],
    ["ai","Mazkiplay Marine Copilot","local rules/model adapter","local/optional"],
    ["registry","Capability Registry","this registry","local"],
    ["camera","Marine Camera","device camera + EXIF/GPS when permitted","local"],
    ["checklist","Smart Checklist","bundled templates + local state","local"],
    ["digital-twin","Digital Twin","local vessel state model","local"]
  ];
  window.MarineFree={
    version:"1.0.0-free",
    mode:"ZERO_COST",
    capabilities,
    state,
    save,
    add(type,data){const item={id:uid(type),createdAt:new Date().toISOString(),...data};(state[type]||(state[type]=[])).push(item);save();return item;},
    list(type){return state[type]||[];},
    distanceNm,bearing,etaHours,
    routeStats(points,sog){let nm=0;for(let i=1;i<points.length;i++)nm+=distanceNm(points[i-1],points[i]);return {distanceNm:nm,bearing:points.length>1?bearing(points[0],points[points.length-1]):null,etaHours:etaHours(nm,sog)};},
    providerStatus(){
      return {osm:"OPEN",openseamap:"OPEN",gebco:"OPEN",bmkg:"PUBLIC",premium:"OPTIONAL",radarHardware:"OPTIONAL"};
    },
    exportData(){return JSON.stringify(state,null,2);},
    clear(){localStorage.removeItem(KEY);location.reload();}
  };
  document.addEventListener("DOMContentLoaded",()=>{
    const el=document.getElementById("marineFreeStatus");
    if(el){const n=capabilities.filter(x=>x[3]!=="provider-optional"&&x[3]!=="optional").length;el.textContent="ZERO-COST CORE • "+n+"/"+capabilities.length+" modul berbasis lokal/open-data";}
    const grid=document.getElementById("marineFreeFeatureGrid");
    if(grid) grid.innerHTML=capabilities.map(x=>'<div class="free-feature"><b>'+x[1]+'</b><span>'+x[2]+'</span><small>'+x[3]+'</small></div>').join("");
    const exp=document.getElementById("marineFreeExport");
    if(exp) exp.onclick=()=>{const blob=new Blob([MarineFree.exportData()],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="marine-os-data.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  });
})();