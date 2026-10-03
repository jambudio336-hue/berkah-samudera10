const StoryApp = {
  initialized: false,
  rows: [],
  init() {
    if (this.initialized) return; this.initialized = true;
    document.getElementById("btnPublishStory")?.addEventListener("click", () => this.publish());
    document.getElementById("btnRefreshStories")?.addEventListener("click", () => this.refresh());
    document.getElementById("storyType")?.addEventListener("change", () => { const t = document.getElementById("storyType").value; document.getElementById("storyFile").classList.toggle("hidden", t === "text"); });
    this.listen(); this.refresh();
  },
  status(text) { const el = document.getElementById("storyStatus"); if (el) el.textContent = text; },
  async publish() {
    if (!SupabaseAuth.user) return this.status("Masuk terlebih dahulu untuk membuat story.");
    const type = document.getElementById("storyType").value, text = document.getElementById("storyText").value.trim(), file = document.getElementById("storyFile").files[0];
    if (type === "text" && !text) return this.status("Tulis isi story terlebih dahulu.");
    if (type !== "text" && !file) return this.status("Pilih foto atau video terlebih dahulu.");
    if (type === "photo" && !file.type.startsWith("image/")) return this.status("File untuk story foto harus berupa gambar.");
    if (type === "video") { if (!file.type.startsWith("video/")) return this.status("File untuk story video harus berupa video."); const duration = await this.videoDuration(file); if (duration > 60) return this.status("Video maksimal 60 detik. Durasi file: " + Math.ceil(duration) + " detik."); }
    let mediaPath = "";
    if (file) { const ext = (file.name.split(".").pop() || (type === "video" ? "mp4" : "jpg")).toLowerCase().replace(/[^a-z0-9]/g, ""); mediaPath = SupabaseAuth.user.id + "/" + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2)) + "." + ext; const { error } = await SupabaseSync.client.storage.from("stories").upload(mediaPath, file, { contentType: file.type, upsert: false }); if (error) return this.status("Upload media gagal: " + error.message); }
    const { error } = await SupabaseSync.client.from("stories").insert({ author_id: SupabaseAuth.user.id, story_type: type, text_content: text, media_path: mediaPath });
    if (error) return this.status("Story gagal diterbitkan: " + error.message); document.getElementById("storyText").value = ""; document.getElementById("storyFile").value = ""; this.status("Story berhasil diterbitkan dan berlaku 24 jam."); this.refresh();
  },
  videoDuration(file) { return new Promise((resolve) => { const v = document.createElement("video"); v.preload = "metadata"; v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); resolve(Number(v.duration) || 0); }; v.onerror = () => resolve(61); v.src = URL.createObjectURL(file); }); },
  async refresh() {
    const signed = !!SupabaseAuth.user, out = document.getElementById("storySignedOut"), inside = document.getElementById("storySignedIn"); if (out) out.classList.toggle("hidden", signed); if (inside) inside.classList.toggle("hidden", !signed); if (!signed || !SupabaseSync.client) return;
    const { data, error } = await SupabaseSync.client.from("stories").select("id,author_id,story_type,text_content,media_path,created_at,expires_at").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(100); if (error) return this.renderMessage("Story gagal dimuat: " + error.message); this.rows = data || [];
    const ids = [...new Set(this.rows.map((x) => x.author_id))]; let profiles = []; if (ids.length) { const res = await SupabaseSync.client.from("profiles").select("id,display_name,role,vessel_name").in("id", ids); profiles = res.data || []; }
    const pmap = Object.fromEntries(profiles.map((p) => [p.id, p])); const rendered = []; for (const row of this.rows) rendered.push(await this.renderRow(row, pmap[row.author_id] || { display_name: "Pengguna Laut" })); const el = document.getElementById("storyFeed"); if (el) el.innerHTML = rendered.join("") || "<p class='muted'>Belum ada story dari teman yang saling follow.</p>";
    el?.querySelectorAll("[data-story-view]").forEach((b) => b.addEventListener("click", () => this.markViewed(b.dataset.storyView)));
    await this.renderOwnViews();
  },
  async renderRow(row, profile) { let media = ""; if (row.media_path) { const res = await SupabaseSync.client.storage.from("stories").createSignedUrl(row.media_path, 86400); if (res.data?.signedUrl) media = row.story_type === "video" ? "<video controls preload='metadata' src='" + this.escape(res.data.signedUrl) + "'></video>" : "<img loading='lazy' src='" + this.escape(res.data.signedUrl) + "' alt='Story foto'>"; }
    const own = row.author_id === SupabaseAuth.user.id; return "<article class='story-card'><div class='story-author'><b>" + this.escape(profile.display_name) + "</b><small>" + this.escape(profile.role || "") + " • " + this.time(row.created_at) + "</small></div>" + (row.text_content ? "<div class='story-text'>" + this.escape(row.text_content) + "</div>" : "") + media + "<div class='story-viewers'>" + (own ? "Story Anda • " : "") + (own ? "lihat riwayat penonton di bawah" : "<button class='btn sm' data-story-view='" + row.id + "'>Tandai sudah ditonton</button>") + "</div></article>";
  },
  async markViewed(storyId) { if (!SupabaseAuth.user || !storyId) return; await SupabaseSync.client.from("story_views").upsert({ story_id: storyId, viewer_id: SupabaseAuth.user.id, viewed_at: new Date().toISOString() }); },
  async renderOwnViews() { const own = this.rows.filter((x) => x.author_id === SupabaseAuth.user.id); const el = document.getElementById("storyOwnViews"); if (!el) return; if (!own.length) { el.innerHTML = "<p class='muted'>Belum ada story aktif.</p>"; return; } const ids = own.map((x) => x.id); const { data: views } = await SupabaseSync.client.from("story_views").select("story_id,viewer_id,viewed_at").in("story_id", ids).order("viewed_at", { ascending: false }); const viewers = [...new Set((views || []).map((x) => x.viewer_id))]; const { data: profiles } = viewers.length ? await SupabaseSync.client.from("profiles").select("id,display_name,role").in("id", viewers) : { data: [] }; const pmap = Object.fromEntries((profiles || []).map((p) => [p.id, p])); el.innerHTML = (views || []).map((v) => "<div class='friend-row'><div class='friend-meta'><b>" + this.escape(pmap[v.viewer_id]?.display_name || "Pengguna") + "</b><small>Melihat story pada " + this.time(v.viewed_at) + "</small></div></div>").join("") || "<p class='muted'>Belum ada yang menonton story Anda.</p>"; },
  renderMessage(message) { const el = document.getElementById("storyFeed"); if (el) el.innerHTML = "<p class='muted'>" + this.escape(message) + "</p>"; },
  listen() { if (!SupabaseSync.client) return; SupabaseSync.client.channel("bs10-stories").on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => { if (SupabaseAuth.user) this.refresh(); }).on("postgres_changes", { event: "*", schema: "public", table: "story_views" }, () => { if (SupabaseAuth.user) this.renderOwnViews(); }).subscribe(); },
  time(v) { return new Date(v).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }); },
  escape(v) { return String(v || "").replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])); }
};
