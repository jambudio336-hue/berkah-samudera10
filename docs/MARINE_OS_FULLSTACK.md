# Marine OS Full-Stack Runtime

Adds a local-first domain runtime over the existing Capacitor HTML/CSS/JavaScript app.

Implemented domains include navigation, BMKG weather lookup, fishing observations, Safety Guardian and anchor watch, vessel profile, maintenance, document metadata, trip economics, social observations, offline-first message queue, data contribution, academy progress, camera metadata capture, checklist, Digital Twin, AIS/radar provider adapters, and local Marine Copilot rules.

Synchronization uses the existing Supabase app_records/Realtime transport when available. No fabricated AIS or radar targets are generated. Cloud AI remains optional and no secret key is placed in the client.

BMKG public maritime endpoints are documented as GET endpoints and the public API documentation states that the documented endpoints do not require an authentication header.