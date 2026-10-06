# Marine OS — Public Live Data Ladder

Updated 2026-10-06.

## Goal

Maximize real-world data without pretending that licensed/private data is public. Marine OS uses a source ladder:

1. AIS realtime: AISStream WebSocket is the first public realtime AIS candidate. It requires an API key and must be consumed server-side; direct browser connections are not allowed. The APK receives only the normalized vessel stream from our gateway.
2. AIS supplemental intelligence: Global Fishing Watch provides dynamic vessel activity, identity/history and fishing-effort APIs after account/API-key access. It is not treated as guaranteed second-by-second AIS.
3. AIS historical: NOAA MarineCadastre provides public U.S. AIS datasets for traffic history/heatmaps, not global realtime.
4. Indonesia marine weather: BMKG official public marine API.
5. Global marine forecast: Open-Meteo Marine API for non-commercial usage within its limits, or self-host Open-Meteo when appropriate.
6. Ocean observations: NOAA ERDDAP exposes machine-readable oceanographic datasets; freshness varies by dataset.
7. Bathymetry: GEBCO plus EMODnet OGC services.
8. Indonesia public data: data.go.id and KKP Portal Data provide public datasets including fisheries/vessel-related information, with freshness varying by dataset.
9. Licensed sources remain adapters: MarineTraffic/Kpler, Navionics/Garmin, Windy API, and proprietary/hardware radar remain available when credentials, approval, license or hardware exists.

## Non-negotiable security

- Never ship provider API keys in the APK.
- Put secrets in a backend/edge gateway or native secure storage only where the provider explicitly permits it.
- The Android client receives normalized, minimum-necessary data.
- Every live object records source, receivedAt, observedAt, freshness, and confidence.
- If a feed is stale/disconnected, the UI must show STALE/OFFLINE instead of presenting old data as live.
- No synthetic AIS or radar targets.

## Realtime status

LIVE means the app received a fresh event from the configured source inside the configured freshness window. It does not mean the upstream provider has an SLA or that every vessel is visible.

## Public references

- AISStream: https://www.aisstream.io/documentation
- Global Fishing Watch APIs: https://globalfishingwatch.org/our-apis/
- NOAA MarineCadastre AIS: https://marinecadastre.gov/ais/
- BMKG Maritime API: https://maritim.bmkg.go.id/apidoc
- Open-Meteo Marine: https://open-meteo.com/
- NOAA ERDDAP: https://osmc.noaa.gov/erddap/
- EMODnet services: https://emodnet.ec.europa.eu/en/emodnet-web-service-documentation
- Indonesia Data Portal: https://data.go.id/
- KKP Data Portal: https://portaldata.kkp.go.id/
