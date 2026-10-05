# Marine OS Zero-Cost Edition — Feature Matrix

## Goal
Run the broad Marine OS feature set with Rp0 provider/API spend. “Free” means no paid key is required by the core implementation; some online services have their own fair-use, attribution, licensing, bandwidth, hardware, or commercial-use requirements.

## Feature strategy

| Area | Free implementation |
|---|---|
| Sea Map | OSM/OpenSeaMap + GEBCO WMS |
| Map modes | Leaflet styles/layers already available; no proprietary chart required |
| GPS/GNSS | Android/browser geolocation |
| SOG/COG/heading | Device sensors + position deltas |
| Navigation | Local geodesic distance/bearing/ETA engine |
| Waypoints/routes | Local storage |
| Track recorder | Existing local track storage |
| Bathymetry | GEBCO 2026 WMS; depth is estimated/decision-support |
| Weather/ocean | BMKG public maritime data; integrate official API only |
| Hazards | OpenSeaMap/OSM + user observations |
| AIS | Provider-neutral adapter; free feeds only where their terms permit |
| Radar | Simulator/overlay in software; real radar remains hardware-dependent |
| Fishing intelligence | Derived model from weather, SST/current/depth and observations |
| Vessel/fleet | Local vessel/member records; optional online sync |
| Maintenance | Local logbook |
| Documents | Local metadata/files |
| Trip economics | Local calculator |
| Social | Local-first records; online transport optional |
| Messenger | Local queue/drafts; online transport optional |
| Offline | Local storage and only permitted map/data caching |
| Marine observations | Local contribution queue |
| Opportunity radar | Local rules/derived signals |
| Marine Academy | Bundled lessons/content |
| Marine Copilot | Local rules/model adapter; cloud AI optional |
| Capability Registry | Bundled registry in app |
| Marine Camera | Device camera + location/time metadata when permitted |
| Smart Checklist | Bundled templates + local state |
| Digital Twin | Local vessel state model |

## Premium adapters kept optional
Navionics/Garmin, MarineTraffic/Kpler, commercial satellite/weather, commercial AI, and radar hardware are adapters rather than dependencies. The app must remain usable when all premium providers are disabled.

## Important licensing/operations rules
- OSM data is free, but OSMF-hosted tile servers are not an unlimited/offline tile source. Do not bulk download or prefetch tile.openstreetmap.org; use an allowed provider or self-host tiles for true offline/bulk use.
- OpenSeaMap data/chart layers require their stated attribution/license conditions.
- GEBCO WMS is available for incorporation into web applications; current GEBCO_Latest WMS is based on GEBCO 2026.
- BMKG's public maritime API exposes forecast/warning products. Commercial third-party integration/republication must follow BMKG permission requirements.
- Never fabricate AIS, radar, chart coverage, survey-grade depth, or emergency information.
- Free data is not automatically equivalent to an official nautical chart or certified navigation equipment.