const SupabaseSync = {
  url: "https://volhmpsomtjnaroylmwe.supabase.co",
  key: "sb_publishable_5wuisICF0Ia8YXwf1McOkg_lMZU9d6g",
  client: null,
  userId: null,
  deviceId: null,
  ready: false,
  realtime: false,
  suppress: false,
  lastPositionAt: 0,
  lastRealtimeAt: 0,
  lastPositionPayload: null,
  channels: [],
  reconnectTimer: null,
  heartbeatTimer: null,
  staleTimer: null,
  reconnectDelay: 1000,
  initPromise: null,
  listenersBound: false,

  ensureClient() {
    if (!window.supabase || !window.supabase.createClient) throw new Error("Supabase JS belum dimuat");
    if (!this.client) {
      this.client = window.supabase.createClient(this.url, this.key, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 20 } }
      });
    }
    return this.client;
  },

  async ensureProfile() {
    const client = this.ensureClient();
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    let user = sessionData && sessionData.session && sessionData.session.user;
    if (!user) {
      const { data, error } = await client.auth.signInAnonymously();
      if (error) throw error;
      user = data && data.user;
    }
    if (!user || !user.id) throw new Error("ID profil anonim tidak tersedia");

    this.userId = user.id;
    this.deviceId = user.id;
    localStorage.setItem("bs10_device_id", user.id);
    localStorage.setItem("bs10_vessel_id", user.id);

    const vesselName = (localStorage.getItem("bs10_vessel_name") || "Berkah Samudera 10").trim().slice(0, 60) || "Kapal Samudera";
    const shareLive = localStorage.getItem("bs10_share_live_location") === "true";
    const { error: profileError } = await client.from("profiles").upsert({
      id: user.id,
      display_name: vesselName,
      vessel_name: vesselName,
      share_live_location: shareLive,
      updated_at: new Date().toISOString()
    }, { onConflict: "id" });
    if (profileError) throw profileError;
    if (!shareLive) {
      await client.from("live_positions").delete().eq("vessel_id", user.id).eq("device_id", user.id);
    }
    return user.id;
  },

  async init() {
    if (this.initPromise) return this.initPromise;
    this.bindNetworkListeners();
    this.initPromise = (async () => {
      try {
        if (!navigator.onLine) {
          this.setStatus("🟡 Offline • profil lokal menunggu koneksi");
          return false;
        }
        await this.ensureProfile();
        if (typeof DeviceProfile !== "undefined") DeviceProfile.renderId(this.deviceId);
        this.ready = true;
        this.connect();
        if (this.cloudSyncEnabled()) this.pullRecords();
        this.setStatus("🟢 Profil anonim siap • mencari kapal yang berbagi lokasi");
        return true;
      } catch (error) {
        this.ready = false;
        if (error && error.code === "anonymous_provider_disabled") {
          this.setStatus("🟡 Profil kapal perlu anonymous sign-in aktif di Supabase");
          if (typeof DeviceProfile !== "undefined") DeviceProfile.renderStatus("Profil otomatis tertahan: pemilik proyek perlu mengaktifkan Anonymous sign-ins di Supabase.");
        } else {
          this.setStatus("🟡 Profil online belum tersambung • data lokal tetap aman");
        }
        return false;
      } finally {
        this.initPromise = null;
      }
    })();
    return this.initPromise;
  },

  bindNetworkListeners() {
    if (this.listenersBound) return;
    this.listenersBound = true;
    window.addEventListener("online", () => { this.init().then(() => { if (this.lastPositionPayload) this.publishPosition(this.lastPositionPayload, true); }); });
    window.addEventListener("offline", () => this.setStatus("🔴 Offline • GPS lokal tetap aktif"));
    document.addEventListener("visibilitychange", () => { if (!document.hidden) this.scheduleReconnect(250); });
  },

  cloudSyncEnabled() { return localStorage.getItem("bs10_cloud_sync_enabled") === "true"; },
  sharingEnabled() { return localStorage.getItem("bs10_share_live_location") === "true"; },
  vesselId() { return this.userId || localStorage.getItem("bs10_device_id") || "local-device"; },

  setStatus(text) {
    const el = document.getElementById("syncState"); if (el) el.textContent = text;
    const k = document.getElementById("kpiSync"); if (k) k.textContent = this.realtime ? "KAPAL LIVE" : (this.ready ? "ONLINE" : "LOKAL");
    const m = document.getElementById("marineNetwork");
    if (m) {
      m.textContent = this.realtime ? "KAPAL LIVE" : (navigator.onLine ? "ONLINE / CONNECTING" : "OFFLINE");
      m.parentElement?.classList.toggle("is-live", this.realtime);
    }
    this.lastRealtimeAt = this.realtime ? Date.now() : this.lastRealtimeAt;
  },

  markRealtime(text) {
    this.realtime = true;
    this.reconnectDelay = 1000;
    this.setStatus(text || "🟢 Peta kapal live tersambung");
    clearTimeout(this.staleTimer);
    this.staleTimer = setTimeout(() => {
      if (this.realtime && Date.now() - this.lastRealtimeAt > 30000) {
        this.realtime = false;
        this.setStatus("🟠 Realtime senyap • mencoba sambung kembali…");
        this.scheduleReconnect(250);
      }
    }, 31000);
  },

  clearChannels() {
    if (!this.client) return;
    this.channels.forEach((channel) => { try { this.client.removeChannel(channel); } catch (_) {} });
    this.channels = [];
  },

  connect() {
    if (!this.client || !this.ready || !navigator.onLine) return;
    this.clearChannels();
    const channels = [];

    const live = this.client.channel("bs10-live-vessels");
    live.on("postgres_changes", { event: "*", schema: "public", table: "live_positions" }, (payload) => {
      this.markRealtime("🟢 Posisi kapal yang berbagi sedang live");
      const row = payload.new || payload.old;
      if (!row || String(row.device_id || row.vessel_id) === this.vesselId()) return;
      if (payload.eventType === "DELETE") {
        if (typeof MapApp !== "undefined" && MapApp.removeRemotePosition) MapApp.removeRemotePosition(row);
      } else if (typeof MapApp !== "undefined" && MapApp.updateRemotePosition) {
        MapApp.updateRemotePosition(row);
      }
    }).subscribe((status) => this.handleChannelStatus(status, "posisi kapal"));
    channels.push(live);

    if (this.cloudSyncEnabled()) {
      const records = this.client.channel("bs10-app-records");
      records.on("postgres_changes", { event: "*", schema: "public", table: "app_records" }, (payload) => {
        this.markRealtime("🟢 Sinkronisasi catatan aktif");
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") this.mergeRecord(payload.new);
      }).subscribe((status) => this.handleChannelStatus(status, "catatan"));
      channels.push(records);

      const notifications = this.client.channel("bs10-app-notifications");
      notifications.on("postgres_changes", { event: "INSERT", schema: "public", table: "app_notifications" }, (payload) => {
        this.markRealtime("🟢 Notifikasi tersinkron");
        if (payload.new && typeof NotificationCenter !== "undefined") {
          NotificationCenter.add({ source: payload.new.source, title: payload.new.title, body: payload.new.body, url: payload.new.url, time: payload.new.created_at });
        }
      }).subscribe((status) => this.handleChannelStatus(status, "notifikasi"));
      channels.push(notifications);
    }

    this.channels = channels;
    this.client.from("live_positions")
      .select("vessel_id,device_id,vessel_name,lat,lon,speed_knots,accuracy_m,heading,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error) return;
        (data || []).forEach((row) => {
          if (String(row.device_id || row.vessel_id) !== this.vesselId() && typeof MapApp !== "undefined" && MapApp.updateRemotePosition) MapApp.updateRemotePosition(row);
        });
      })
      .catch(() => {});

    if (this.cloudSyncEnabled()) this.pullRecords();
    this.startHeartbeat();
  },

  handleChannelStatus(status, label) {
    if (status === "SUBSCRIBED") {
      this.markRealtime("🟢 Peta kapal realtime tersambung");
      return;
    }
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
      this.realtime = false;
      this.setStatus("🟠 Realtime " + label + " putus • mencoba sambung kembali…");
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
      else this.setStatus("🟢 Realtime kapal aktif");
    }, 10000);
  },

  async updateProfile(vesselName) {
    await this.ensureProfile();
    const name = String(vesselName || "Kapal Samudera").trim().slice(0, 60) || "Kapal Samudera";
    const { error } = await this.client.from("profiles").upsert({
      id: this.userId,
      display_name: name,
      vessel_name: name,
      share_live_location: this.sharingEnabled(),
      updated_at: new Date().toISOString()
    }, { onConflict: "id" });
    if (error) throw error;
    if (this.sharingEnabled()) {
      const { error: nameError } = await this.client.from("live_positions").update({ vessel_name: name, updated_at: new Date().toISOString() }).eq("vessel_id", this.userId).eq("device_id", this.userId);
      if (nameError) throw nameError;
    }
    return this.userId;
  },

  async setShareLiveLocation(enabled) {
    const previous = this.sharingEnabled();
    localStorage.setItem("bs10_share_live_location", String(Boolean(enabled)));
    if (!navigator.onLine) {
      if (enabled) {
        localStorage.setItem("bs10_share_live_location", String(previous));
        throw new Error("Perlu internet untuk mengaktifkan berbagi lokasi");
      }
      this.setStatus("🟡 GPS berhenti dikirim • pencabutan izin cloud menunggu koneksi");
      return this.userId;
    }
    await this.ensureProfile();
    const { error } = await this.client.from("profiles").update({
      share_live_location: Boolean(enabled),
      vessel_name: String(localStorage.getItem("bs10_vessel_name") || "Kapal Samudera").trim().slice(0, 60),
      display_name: String(localStorage.getItem("bs10_vessel_name") || "Kapal Samudera").trim().slice(0, 60),
      updated_at: new Date().toISOString()
    }).eq("id", this.userId);
    if (error) {
      if (enabled) localStorage.setItem("bs10_share_live_location", String(previous));
      throw error;
    }
    if (enabled && this.lastPositionPayload) await this.publishPosition(this.lastPositionPayload, true);
    if (!enabled) {
      await this.client.from("live_positions").delete().eq("vessel_id", this.userId).eq("device_id", this.userId);
      if (typeof MapApp !== "undefined" && MapApp.removeRemotePosition) MapApp.removeRemotePosition({ vessel_id: this.userId, device_id: this.userId });
    }
    this.ready = true;
    this.connect();
    return this.userId;
  },

  async publishPosition(payload, force) {
    this.lastPositionPayload = { ...payload };
    if (!this.sharingEnabled() || !navigator.onLine) return;
    if (!this.userId || !this.client) {
      const ok = await this.init();
      if (!ok) return;
    }
    const now = Date.now();
    if (!force && now - this.lastPositionAt < 5000) return;
    this.lastPositionAt = now;
    const vesselName = String(localStorage.getItem("bs10_vessel_name") || "Kapal Samudera").trim().slice(0, 60) || "Kapal Samudera";
    const row = {
      vessel_id: this.userId,
      device_id: this.userId,
      vessel_name: vesselName,
      lat: Number(payload.lat),
      lon: Number(payload.lon),
      speed_knots: Number(payload.speed || 0) / 1.852,
      accuracy_m: Number(payload.accuracy || 0),
      heading: Number.isFinite(Number(payload.heading)) ? Number(payload.heading) : null,
      updated_at: new Date().toISOString()
    };
    const { error } = await this.client.from("live_positions").upsert(row, { onConflict: "vessel_id" });
    if (!error) this.setStatus(this.realtime ? "🟢 Lokasi kapal dibagikan realtime" : "🟡 Mengirim posisi kapal…");
    else this.scheduleReconnect();
  },

  async pushCollection(type, arr) {
    if (!this.cloudSyncEnabled() || !this.ready || !this.client || this.suppress || !Array.isArray(arr) || !navigator.onLine) return;
    const rows = arr.map((item) => ({
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
    if (!this.cloudSyncEnabled() || !this.ready || !this.client || !navigator.onLine) return;
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
    if (!this.cloudSyncEnabled() || !this.ready || !this.client || !navigator.onLine) return;
    const { data } = await this.client.from("app_records").select("id,record_type,payload").limit(500);
    (data || []).forEach((row) => this.mergeRecord(row));
  },

  mergeRecord(row) {
    if (row && row.record_type && row.payload && typeof Store !== "undefined" && Store.mergeRemote) Store.mergeRemote(row.record_type, row.payload);
  }
};
