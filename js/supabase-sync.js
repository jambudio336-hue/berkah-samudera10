const SupabaseSync = {
  url: "https://volhmpsomtjnaroylmwe.supabase.co",
  key: "sb_publishable_5wuisICF0Ia8YXwf1McOkg_lMZU9d6g",
  client: null,
  deviceId: localStorage.getItem("bs10_device_id") || (() => { const id = "dev-" + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2)); localStorage.setItem("bs10_device_id", id); return id; })(),
  ready: false,
  realtime: false,
  suppress: false,
  lastPositionAt: 0,
  lastRealtimeAt: 0,
  friendIds: [],
  channels: [],
  reconnectTimer: null,
  heartbeatTimer: null,
  reconnectDelay: 1000,

  init() {
    try {
      if (!window.supabase || !window.supabase.createClient) throw new Error("Supabase JS belum dimuat");
      this.client = window.supabase.createClient(this.url, this.key, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
        realtime: { params: { eventsPerSecond: 20 } }
      });
      this.ready = true;
      this.connect();
      this.pullRecords();
      this.setStatus("🟡 Menghubungkan Realtime…");
      window.addEventListener("online", () => this.scheduleReconnect(250));
      window.addEventListener("offline", () => this.setStatus("🔴 Internet terputus • cache lokal aktif"));
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) this.scheduleReconnect(250);
      });
    } catch (_) {
      this.ready = false;
      this.setStatus("🟡 Mode lokal • Supabase belum tersambung");
    }
  },

  vesselId() { return localStorage.getItem("bs10_vessel_id") || "kapal-utama"; },

  setStatus(text) {
    const el = document.getElementById("syncState"); if (el) el.textContent = text;
    const k = document.getElementById("kpiSync"); if (k) k.textContent = this.realtime ? "REALTIME" : (this.ready ? "CONNECTING" : "LOKAL");
    const m = document.getElementById("marineNetwork");
    if (m) {
      m.textContent = this.realtime ? "REALTIME" : (navigator.onLine ? "ONLINE / CONNECTING" : "OFFLINE");
      m.parentElement?.classList.toggle("is-live", this.realtime);
    }
    this.lastRealtimeAt = this.realtime ? Date.now() : this.lastRealtimeAt;
  },

  markRealtime(text) {
    this.realtime = true;
    this.reconnectDelay = 1000;
    this.setStatus(text || "🟢 Supabase Realtime aktif");
    clearTimeout(this.staleTimer);
    this.staleTimer = setTimeout(() => {
      if (this.realtime && Date.now() - this.lastRealtimeAt > 30000) {
        this.realtime = false;
        this.setStatus("🟠 Realtime senyap >30 dtk • mencoba reconnect…");
        this.scheduleReconnect(250);
      }
    }, 31000);
  },

  clearChannels() {
    if (!this.client) return;
    this.channels.forEach(ch => { try { this.client.removeChannel(ch); } catch (_) {} });
    this.channels = [];
  },

  connect() {
    if (!this.client || !navigator.onLine) return;
    this.clearChannels();

    const live = this.client.channel("bs10-live-positions");
    live.on("postgres_changes", { event: "*", schema: "public", table: "live_positions" }, (payload) => {
      this.markRealtime("🟢 Realtime posisi kapal aktif");
      const row = payload.new;
      if (row && row.vessel_id !== this.vesselId() && typeof MapApp !== "undefined" && MapApp.updateRemotePosition) MapApp.updateRemotePosition(row);
    }).subscribe(status => this.handleChannelStatus(status, "posisi"));

    const records = this.client.channel("bs10-app-records");
    records.on("postgres_changes", { event: "*", schema: "public", table: "app_records" }, (payload) => {
      this.markRealtime("🟢 Realtime data operasi aktif");
      if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") this.mergeRecord(payload.new);
    }).subscribe(status => this.handleChannelStatus(status, "data"));

    const locations = this.client.channel("bs10-user-locations");
    locations.on("postgres_changes", { event: "*", schema: "public", table: "user_locations" }, (payload) => {
      this.markRealtime("🟢 Realtime lokasi teman aktif");
      const row = payload.new;
      if (row && this.friendIds.includes(row.user_id) && typeof MapApp !== "undefined" && MapApp.updateRemotePosition) {
        MapApp.updateRemotePosition({ ...row, vessel_id: row.user_id });
      }
    }).subscribe(status => this.handleChannelStatus(status, "teman"));

    const notifications = this.client.channel("bs10-app-notifications");
    notifications.on("postgres_changes", { event: "INSERT", schema: "public", table: "app_notifications" }, (payload) => {
      this.markRealtime("🟢 Realtime notifikasi aktif");
      if (payload.new && typeof NotificationCenter !== "undefined") {
        NotificationCenter.add({ source: payload.new.source, title: payload.new.title, body: payload.new.body, url: payload.new.url, time: payload.new.created_at });
      }
    }).subscribe(status => this.handleChannelStatus(status, "notifikasi"));

    this.channels = [live, records, locations, notifications];

    this.client.from("live_positions")
      .select("vessel_id,device_id,lat,lon,speed_knots,accuracy_m,heading,updated_at")
      .limit(100)
      .then(({ data }) => (data || []).forEach(row => {
        if (row.vessel_id !== this.vesselId() && typeof MapApp !== "undefined" && MapApp.updateRemotePosition) MapApp.updateRemotePosition(row);
      }))
      .catch(() => {});

    this.startHeartbeat();
  },

  handleChannelStatus(status, label) {
    if (status === "SUBSCRIBED") {
      this.markRealtime("🟢 REALTIME • WebSocket tersambung");
      return;
    }
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
      this.realtime = false;
      this.setStatus("🟠 Realtime " + label + " putus • reconnect otomatis…");
      this.scheduleReconnect();
    }
  },

  scheduleReconnect(delay) {
    if (!this.ready || !navigator.onLine || this.reconnectTimer) return;
    const wait = Number.isFinite(delay) ? delay : this.reconnectDelay;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    }, wait);
  },

  startHeartbeat() {
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (!navigator.onLine) return;
      if (!this.realtime) this.scheduleReconnect(250);
      else this.setStatus("🟢 REALTIME • WebSocket aktif");
    }, 10000);
  },

  async publishPosition(payload) {
    if (!this.ready || !this.client || !navigator.onLine) return;
    const now = Date.now();
    if (now - this.lastPositionAt < 3000) return;
    this.lastPositionAt = now;

    const row = {
      vessel_id: this.vesselId(),
      device_id: this.deviceId,
      lat: payload.lat,
      lon: payload.lon,
      speed_knots: Number(payload.speed || 0) / 1.852,
      accuracy_m: payload.accuracy,
      heading: payload.heading || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await this.client.from("live_positions").upsert(row);
    if (!error) this.setStatus(this.realtime ? "🟢 REALTIME • posisi kapal tersinkron" : "🟡 Posisi tersimpan • menunggu Realtime");
    else this.scheduleReconnect();
    
    if (typeof SupabaseAuth !== "undefined" && SupabaseAuth.user) {
      await this.client.from("user_locations").upsert({
        user_id: SupabaseAuth.user.id,
        lat: payload.lat,
        lon: payload.lon,
        speed_knots: row.speed_knots,
        accuracy_m: payload.accuracy,
        heading: payload.heading || null,
        sharing_enabled: SupabaseAuth.profile?.share_location !== false,
        updated_at: new Date().toISOString()
      });
    }
  },

  async pushCollection(type, arr) {
    if (!this.ready || !this.client || this.suppress || !Array.isArray(arr) || !navigator.onLine) return;
    const rows = arr.map(item => ({
      id: String(item.id),
      vessel_id: this.vesselId(),
      device_id: this.deviceId,
      record_type: type,
      payload: item,
      updated_at: new Date().toISOString()
    }));
    if (rows.length) {
      const { error } = await this.client.from("app_records").upsert(rows);
      if (error) this.scheduleReconnect();
    }
  },

  async pushNotification(item) {
    if (!this.ready || !this.client || !navigator.onLine) return;
    await this.client.from("app_notifications").upsert({
      id: this.deviceId + "-" + String(item.time || Date.now()),
      vessel_id: this.vesselId(),
      device_id: this.deviceId,
      source: item.source,
      title: item.title,
      body: item.body,
      url: item.url || null
    });
  },

  async pullRecords() {
    if (!this.ready || !this.client || !navigator.onLine) return;
    const { data } = await this.client.from("app_records").select("id,record_type,payload").limit(500);
    (data || []).forEach(row => this.mergeRecord(row));
  },

  mergeRecord(row) {
    if (row && row.record_type && row.payload && typeof Store !== "undefined" && Store.mergeRemote) Store.mergeRemote(row.record_type, row.payload);
  }
};
