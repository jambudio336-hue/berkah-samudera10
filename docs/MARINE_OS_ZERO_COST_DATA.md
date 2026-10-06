# Marine OS — Zero-Cost Marine Data Stack

Target: build the largest possible Marine OS core with Rp0 provider/API spend.

## Active open/public layers

- OpenStreetMap: base map data under ODbL. Production/bulk/offline tile usage must use an allowed provider or self-hosted infrastructure.
- OpenSeaMap: marine/seamark data using OSM/OpenSeaMap licensing and attribution requirements.
- GEBCO 2026 WMS: official bathymetry WMS at https://wms.gebco.net/mapserv? .
- CARTO public map tiles: optional base-map style; provider terms and attribution apply.
- BMKG Maritime API: official public marine forecast API. Automated access must use the official API; commercial third-party integration/repackaging requires the required written permission.

## Intentionally not enabled

- Navionics/Garmin: official SDK + license required.
- MarineTraffic/Kpler: official API + license required.
- BATNAS: enable only after authorized dataset/access is confirmed.
- Physical radar: requires real hardware/gateway.
- Paid AI/cloud providers: optional; local/open models can be considered for a zero-cost mode.

## Safety

Open-data bathymetry, crowdsourced seamarks, AIS feeds, weather data and derived fishing intelligence are decision-support only. They must not be represented as a replacement for official nautical charts, ECDIS, certified radar/AIS, sonar, visual lookout, or applicable maritime procedures.
