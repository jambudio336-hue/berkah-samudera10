# Marine OS expansion plan

This branch expands Berkah Samudera10 toward the Marine OS architecture.

## Existing foundation retained

- Capacitor Android wrapper
- Leaflet map
- GPS/GNSS tracking and local track cache
- GEBCO bathymetry overlay
- OpenSeaMap seamarks
- weather/Windy integration
- Supabase Auth/Realtime/Storage
- profiles, follows, user locations and Stories
- catch, supplies, crew and operations records

## New product domains

1. Marine Command Center
2. Sea / nautical map layer engine
3. Navionics/Garmin adapter (official SDK/license required)
4. MarineTraffic/Kpler AIS adapter (commercial API/license required)
5. Avenza-style offline georeferenced map workspace (GeoPDF/GeoTIFF/MBTiles/GPX/KML; user-owned/licensed data only)
6. Real radar integration layer (hardware gateway; NMEA/Ethernet/protocol support depends on radar)
7. AIS + radar situational awareness and CPA/TCPA
8. BATNAS + GEBCO bathymetry provider abstraction
9. BMKG marine weather/ocean warnings provider abstraction
10. fishing intelligence and user observations
11. route, waypoint, ETA and voyage recorder
12. hazards, wrecks, reefs and navigation aids
13. Safety Guardian / SOS / anchor watch
14. vessel and fleet management
15. maintenance, documents and digital logbook
16. marine economy: fuel, fish prices, trip cost and profit
17. Marine Data Contribution
18. Mazkiplay.ai Marine Copilot
19. feature/capability registry so AI understands every app upgrade
20. offline-first cache and queued synchronization

## Provider rule

Proprietary providers are represented by adapters and configuration placeholders. No proprietary chart/AIS data is copied into the repository.

- Navionics: integrate only through Garmin/Navionics authorized SDK and developer token.
- MarineTraffic: integrate only through authorized API service and API credentials.
- Radar: accept data from supported onboard hardware/gateway; a phone-only UI is not a real radar.
- Avenza: implement compatibility with geospatial formats where the user has the rights to the map data.

## Safety

Depth, AIS, radar, route and hazard layers are decision-support features. They must not be presented as a substitute for certified navigation equipment, official nautical charts, lookout, radar/AIS procedures or local maritime regulations.

## Implementation order

### Phase 1 — foundation
- feature registry
- provider abstraction
- Marine Command Center UI
- configuration and capability manifest
- map layer controls
- offline-ready data model

### Phase 2 — marine data
- BATNAS/GEBCO
- BMKG
- hazards/navigation aids
- AIS provider adapter
- route/ETA engine

### Phase 3 — social and vessel operations
- vessel profiles
- fleet
- vessel search
- map sharing
- messaging/calls
- maintenance/documents/economics

### Phase 4 — premium integrations
- Navionics SDK
- MarineTraffic API
- hardware radar
- fish finder/sonar
- external marine instruments

### Phase 5 — AI
- Mazkiplay.ai Marine Copilot
- capability registry ingestion
- authorized app tools
- multilingual voice/text
- safety escalation and human review

## Required secrets

Never commit provider secrets to Git.

Use server-side environment/secret storage for commercial APIs and privileged credentials. Public frontend keys must be publishable-only and protected by RLS where applicable.
