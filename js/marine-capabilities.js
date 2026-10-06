(function(){
  "use strict";

  // Single source of truth for what Marine OS actually implements.
  // Status values:
  // implemented = usable in the current app without an external paid credential.
  // partial = code/UX exists but a provider, native bridge, or larger backend is still required.
  // planned = blueprint only; not exposed as a finished capability.
  const capabilities = [
    ["sea-map","implemented","OSM, OpenSeaMap, GEBCO, CARTO layers"],
    ["navigation","implemented","GNSS, route distance, bearing, ETA, track"],
    ["ais","partial","adapter/runtime exists; live AIS feed requires authorized provider/receiver"],
    ["radar","partial","runtime/simulator exists; real radar requires hardware gateway"],
    ["bathymetry","implemented","GEBCO 2026 WMS; BATNAS remains unavailable until authorized access"],
    ["weather","implemented","BMKG/Open-Meteo marine sources"],
    ["fishing","implemented","indicative scoring and catch observations"],
    ["hazards","implemented","OSM/Overpass hazard lookup; absence of a result is not proof of safety"],
    ["safety","implemented","GNSS/network/anchor-watch decision support"],
    ["vessel","implemented","local vessel profile and operational context"],
    ["maintenance","implemented","engine hours and maintenance records"],
    ["documents","partial","metadata/file picker; durable cloud vault is not yet complete"],
    ["economy","implemented","trip cost and P/L calculations"],
    ["social","partial","local observations plus Supabase sync; full social graph/feed is incomplete"],
    ["messenger","partial","offline queue/realtime transport exists; full media/call stack is incomplete"],
    ["offline","partial","local cache/queue exists; full nautical offline package pipeline is incomplete"],
    ["data","implemented","observation contribution queue/export"],
    ["opportunity","planned","registry entry exists; full opportunity engine is not complete"],
    ["academy","implemented","local progress/runtime"],
    ["ai","partial","Jarvis/OpenRouter voice assistant; full multimodal tool execution is not complete"],
    ["registry","implemented","capability registry and provider manifest"],
    ["camera","implemented","camera/metadata capture flow"],
    ["checklist","implemented","operational and emergency checklist runtime"],
    ["digital-twin","partial","local operational twin; full equipment/fleet twin is not complete"]
  ];

  const api = {
    version: 1,
    capabilities: capabilities.map(([id,status,detail]) => ({id,status,detail})),
    get(id){ return this.capabilities.find(x=>x.id===id) || null; },
    status(id){ return this.get(id)?.status || "unknown"; },
    implemented(){ return this.capabilities.filter(x=>x.status==="implemented"); },
    partial(){ return this.capabilities.filter(x=>x.status==="partial"); },
    planned(){ return this.capabilities.filter(x=>x.status==="planned"); }
  };

  window.MarineCapabilities = api;
})();
