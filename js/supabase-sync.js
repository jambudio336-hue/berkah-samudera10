const SupabaseSync = {
  url: "https://volhmpsomtjnaroylmwe.supabase.co",
  key: "sb_publishable_5wuisICF0Ia8YXwf1McOkg_lMZU9d6g",
  client: null,
  deviceId: localStorage.getItem("bs10_device_id") || (() => { const id = "dev-" + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2)); localStorage.setItem("bs10_device_id", id); return id; })(),
  ready: false,
  suppress: false,
  lastPositionAt: 0,
  init() {
    try { if (!window.supabase || !window.supabase.createClient) throw new Error("Supabase JS belum dimuat"); this.client = window.supabase.createClient(this.url, this.key); this.ready = true; this.connect(); this.pullRecords(); this.setStatus("🟢 Supabase Realtime aktif"); } catch (_) { this.setStatus("🟡 Mode lokal • Supabase belum tersambung"); }
  },
  vesselId() { return localStorage.getItem("bs10_vessel_id") || "kapal-utama"; },
  setStatus(text) { const el = document.getElementById("syncState"); if (el) el.textContent = text; const k = document.getElementById("kpiSync"); if (k) k.textContent = this.ready ? "REALTIME" : "LOKAL"; },
  connect() {
    if (!this.client) return;
    this.client.channel("bs10-live-positions").on("postgres_changes", { event: "*", schema: "public", table: "live_positions" }, (payload) => { const row = payload.new; if (row && row.vessel_id !== this.vesselId() && typeof MapApp !== "undefined" && MapApp.updateRemotePosition) MapApp.updateRemotePosition(row); }).subscribe();
    this.client.channel("bs10-app-records").on("postgres_changes", { event: "*", schema: "public", table: "app_records" }, (payload) => { if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") this.mergeRecord(payload.new); }).subscribe();
    this.client.channel("bs10-app-notifications").on("postgres_changes", { event: "INSERT", schema: "public", table: "app_notifications" }, (payload) => { if (payload.new && typeof NotificationCenter !== "undefined") NotificationCenter.add({ source: payload.new.source, title: payload.new.title, body: payload.new.body, url: payload.new.url, time: payload.new.created_at }); }).subscribe();
    this.client.from("live_positions").select("vessel_id,device_id,lat,lon,speed_knots,accuracy_m,heading,updated_at").limit(50).then(({ data }) => (data || []).forEach((row) => { if (row.vessel_id !== this.vesselId() && typeof MapApp !== "undefined" && MapApp.updateRemotePosition) MapApp.updateRemotePosition(row); }));
  },
  async publishPosition(payload) {
    if (!this.ready || !this.client) return; const now = Date.now(); if (now - this.lastPositionAt < 3000) return; this.lastPositionAt = now;
    await this.client.from("live_positions").upsert({ vessel_id: this.vesselId(), device_id: this.deviceId, lat: payload.lat, lon: payload.lon, speed_knots: Number(payload.speed || 0) / 1.852, accuracy_m: payload.accuracy, heading: payload.heading || null, updated_at: new Date().toISOString() });
  },
  async pushCollection(type, arr) {
    if (!this.ready || !this.client || this.suppress || !Array.isArray(arr)) return;
    const rows = arr.map((item) => ({ id: String(item.id), vessel_id: this.vesselId(), device_id: this.deviceId, record_type: type, payload: item, updated_at: new Date().toISOString() })); if (rows.length) await this.client.from("app_records").upsert(rows);
  },
  async pushNotification(item) {
    if (!this.ready || !this.client) return; await this.client.from("app_notifications").upsert({ id: this.deviceId + "-" + String(item.time || Date.now()), vessel_id: this.vesselId(), device_id: this.deviceId, source: item.source, title: item.title, body: item.body, url: item.url || null });
  },
  async pullRecords() { if (!this.ready || !this.client) return; const { data } = await this.client.from("app_records").select("id,record_type,payload").limit(500); (data || []).forEach((row) => this.mergeRecord(row)); },
  mergeRecord(row) { if (row && row.record_type && row.payload && typeof Store !== "undefined" && Store.mergeRemote) Store.mergeRemote(row.record_type, row.payload); }
};
