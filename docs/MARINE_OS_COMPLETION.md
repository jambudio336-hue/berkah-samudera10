# Marine OS Full-Stack Completion Program

This document is the implementation contract for completing the Marine OS blueprint without claiming a feature is finished before it works.

## Definition of done

A capability is only **implemented** when:
- the UI exposes the capability;
- the client runtime has a real data path;
- the backend/storage path exists when cloud persistence is required;
- offline behavior is defined;
- errors and stale data are visible;
- no fake AIS/radar/weather/depth/position data is generated;
- the feature passes the repository CI syntax/build checks;
- provider/license requirements are clearly surfaced when an external service is required.

## Workstreams

### Phase 1 — Foundation
- [x] authoritative capability registry
- [x] CI publishes the APK from the exact commit
- [x] CI publishes a full-stack source ZIP from the exact commit
- [ ] production secret handling / Android Keystore
- [ ] Supabase RLS hardening
- [ ] unified error/stale-data telemetry

### Phase 2 — Navigation & marine data
- [x] GNSS/navigation baseline
- [x] GEBCO/OpenSeaMap baseline
- [ ] full offline chart package pipeline
- [ ] route safety checks using hazards/weather/current/draft
- [ ] voyage recorder/replay
- [ ] tides/currents source normalization

### Phase 3 — Traffic & sensors
- [ ] AIS provider/receiver adapters with authenticated server gateway
- [ ] CPA/TCPA engine
- [ ] real radar gateway protocol adapters
- [ ] sensor health/status panel

### Phase 4 — Weather, fishing & markets
- [x] BMKG/Open-Meteo baseline
- [ ] normalized marine forecast model
- [ ] warning ingestion and deduplication
- [ ] fishing score v2 with explainable factors
- [ ] KKP fish-price ingestion with source/time/region metadata

### Phase 5 — Operations
- [ ] fleet management
- [ ] crew permissions
- [ ] cargo/manifest
- [ ] maintenance schedules/reminders
- [ ] document file vault and expiry workflow
- [ ] trip economics and settlement

### Phase 6 — Social & communications
- [ ] profiles/follow graph
- [ ] posts/comments/likes/hashtags
- [ ] stories/views
- [ ] private/group messaging
- [ ] media/voice messages
- [ ] notification center
- [ ] voice/video calling adapter

### Phase 7 — AI
- [x] Jarvis/OpenRouter baseline
- [ ] secure credential storage
- [ ] multimodal input pipeline
- [ ] authorized read-only app tools
- [ ] confirmation gate for consequential actions
- [ ] feature-registry-aware Copilot
- [ ] offline/local fallback model adapter

### Phase 8 — Safety
- [x] GNSS/network/anchor baseline
- [ ] SOS workflow
- [ ] MAYDAY/PAN-PAN structured assistant
- [ ] hazard/weather/AIS alert engine
- [ ] stale-data and confidence indicators
- [ ] emergency checklist/audit trail

### Phase 9 — Advanced product
- [ ] Universal Search
- [ ] Tap Anything on Map
- [ ] Opportunity Radar
- [ ] Reputation
- [ ] Moments
- [ ] Signal/connectivity map
- [ ] adaptive/Captain Mode
- [ ] wearable adapter
- [ ] complete Digital Twin

### Phase 10 — Release hardening
- [ ] automated tests for critical calculations
- [ ] dependency/security scans
- [ ] signed release pipeline
- [ ] SBOM/attestation
- [ ] crash/error monitoring
- [ ] backup/disaster-recovery verification
- [ ] release smoke test on Android

## Rule

External licensed services such as commercial AIS, Navionics/Garmin charts, and physical radar are implemented as **provider adapters**, not simulated data. The app must remain useful with zero-cost/public sources where legally and technically possible.
