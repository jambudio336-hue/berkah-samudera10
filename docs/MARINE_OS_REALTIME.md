# Marine OS Realtime / Online Mode

## Target
Marine OS uses an online-first realtime layer while preserving local/offline operation when the connection disappears.

## Current implementation
- Supabase Realtime WebSocket subscriptions for live vessel positions, shared locations, app records, and notifications.
- Automatic reconnect with exponential backoff up to 30 seconds.
- Network/visibility recovery reconnects the channels.
- Latest vessel position is retained locally and re-published when connectivity returns.
- GPS position publishing is rate-limited to about one update every 3 seconds.
- Existing local storage remains the safety net when internet is unavailable.
- The UI distinguishes REALTIME, ONLINE/CONNECTING, and OFFLINE states.

## Important Android limitation
"Online selalu" cannot literally be guaranteed. Android, battery saver, OS background restrictions, lost cellular/satellite service, airplane mode, or a killed process can stop network connections. This implementation reconnects aggressively while the app process is active and resumes when it returns online.

Continuous GPS/network tracking while the app is backgrounded requires a dedicated Android foreground-service/background-location implementation with the appropriate Android permissions and policy review. It should be added separately rather than pretending a WebSocket can stay alive after the OS kills the app.

## Security
The client uses a Supabase publishable key only. No service-role/secret key is bundled in the APK.

Realtime data must still be governed by Supabase RLS. Do not add a public Broadcast channel for private vessel locations without explicit Realtime authorization policies.

## Data freshness
A realtime connection means the app receives database changes through the WebSocket when connected; it does not mean every vessel on Earth is visible. AIS and other external feeds remain provider/coverage dependent.

## Build
The Marine OS CI workflow now supports manual dispatch and uploads a debug APK artifact after a successful Android build.
