const SupabaseAuth = {
  user: null,
  profile: null,
  followingIds: [],
  init() {
    const client = SupabaseSync.client; if (!client) return;
    document.getElementById("btnGuestSave")?.addEventListener("click", () => this.registerContact());
    document.getElementById("guestContact")?.addEventListener("change", () => this.registerContact());
    document.getElementById("guestContact")?.addEventListener("keydown", (e) => { if (e.key === "Enter") this.registerContact(); });
    document.getElementById("btnSaveProfile")?.addEventListener("click", () => this.saveProfile());
    document.getElementById("btnSearchFriends")?.addEventListener("click", () => this.search());
    client.auth.onAuthStateChange((_event, session) => setTimeout(() => this.setSession(session), 0));
    client.auth.getSession().then(({ data }) => this.setSession(data.session));
  },
  async setSession(session) {
    if (!session?.user && SupabaseSync.client) {
      const { data } = await SupabaseSync.client.auth.signInAnonymously();
      session = data?.session || null;
    }
    this.user = session?.user || null;
    document.getElementById("authSignedOut")?.classList.add("hidden");
    document.getElementById("authSignedIn")?.classList.remove("hidden");
    if (this.user) {
      await this.ensureProfile(); await this.loadProfile();
      SupabaseSync.client.removeAllChannels(); SupabaseSync.connect();
      await this.refreshFollowing(); await this.loadSocialStats();
      SupabaseSync.setStatus("🟢 ID otomatis & Realtime aktif");
      if (typeof StoryApp !== "undefined") StoryApp.init();
    }
  },
  status(text) { const el=document.getElementById("authStatus"); if(el) el.textContent=text; },
  async registerContact() {
    if (!this.user) return this.status("Menyiapkan ID otomatis…");
    const contact=document.getElementById("guestContact")?.value.trim()||"";
    const isEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const isPhone=/^\+?[0-9][0-9\s-]{7,20}$/.test(contact);
    if(!isEmail&&!isPhone) return this.status("Masukkan email atau nomor HP yang valid.");
    const payload={id:this.user.id,email:isEmail?contact:null,phone:isPhone?contact.replace(/[\s-]/g,""):null,display_name:document.getElementById("profileName")?.value.trim()||"Pelaut "+this.user.id.slice(0,8),updated_at:new Date().toISOString()};
    const {error}=await SupabaseSync.client.from("profiles").upsert(payload);
    if(error) return this.status("Profil gagal disimpan: "+error.message);
    this.profile={...(this.profile||{}),...payload};
    const id=document.getElementById("guestId"); if(id) id.textContent=this.user.id;
    this.status("✅ Profil aktif. ID otomatis dibuat. Kontak belum diverifikasi.");
    await this.loadProfile();
  },
  async ensureProfile() { if(!this.user)return; await SupabaseSync.client.from("profiles").upsert({id:this.user.id,email:this.user.email||null,phone:this.user.phone||null,display_name:"Pelaut "+this.user.id.slice(0,8)},{onConflict:"id",ignoreDuplicates:true}); },
  async loadProfile() { const {data}=await SupabaseSync.client.from("profiles").select("*").eq("id",this.user.id).maybeSingle(); this.profile=data||{}; const p=this.profile; const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||""}; set("profileName",p.display_name); set("guestContact",p.email||p.phone||""); set("profileBio",p.bio); set("profileRole",p.role||"abk"); set("profileAvatar",p.avatar_url); set("profileVessel",p.vessel_name); set("profileCargo",p.vessel_cargo); const share=document.getElementById("profileShareLocation");if(share)share.checked=p.share_location!==false; const h=document.getElementById("profileHeading");if(h)h.textContent=p.display_name||"Profil Saya"; const id=document.getElementById("guestId");if(id)id.textContent=this.user.id; },
  async saveProfile() { if(!this.user)return; const contact=document.getElementById("guestContact")?.value.trim()||""; const isEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact); const isPhone=/^\+?[0-9][0-9\s-]{7,20}$/.test(contact); const payload={id:this.user.id,email:isEmail?contact:(this.profile?.email||null),phone:isPhone?contact.replace(/[\s-]/g,""):(this.profile?.phone||null),display_name:document.getElementById("profileName").value.trim()||"Pelaut "+this.user.id.slice(0,8),bio:document.getElementById("profileBio").value.trim(),role:document.getElementById("profileRole").value,avatar_url:document.getElementById("profileAvatar").value.trim(),vessel_name:document.getElementById("profileVessel").value.trim(),vessel_cargo:document.getElementById("profileCargo").value.trim(),share_location:document.getElementById("profileShareLocation").checked,updated_at:new Date().toISOString()}; const {error}=await SupabaseSync.client.from("profiles").upsert(payload); const st=document.getElementById("profileStatus");if(st)st.textContent=error?"Gagal menyimpan: "+error.message:"Profil tersimpan.";if(!error){this.profile=payload;await this.refreshFollowing();await this.loadSocialStats();} },
  async search() { if (!this.user) return; const term = document.getElementById("friendSearch")?.value.trim(); if (!term) return; const { data, error } = await SupabaseSync.client.from("profiles").select("id,display_name,bio,role,vessel_name,vessel_cargo,avatar_url").or("display_name.ilike.%" + term + "%,vessel_name.ilike.%" + term + "%").neq("id", this.user.id).limit(20); const el = document.getElementById("friendResults"); if (!el) return; if (error) { el.textContent = "Pencarian gagal: " + error.message; return; } el.innerHTML = (data || []).map((p) => this.friendRow(p, this.followingIds.includes(p.id))).join(""); el.querySelectorAll("[data-follow]").forEach((b) => b.addEventListener("click", () => this.toggleFollow(b.dataset.follow, b.dataset.state === "true"))); },
  friendRow(p, following) { return "<div class='friend-row'><div class='friend-meta'><b>" + this.escape(p.display_name) + "</b><small>" + this.escape(p.role) + (p.vessel_name ? " • " + this.escape(p.vessel_name) : "") + "</small><small>" + this.escape(p.bio || "") + "</small></div><button class='btn sm' data-follow='" + p.id + "' data-state='" + following + "'>" + (following ? "Unfollow" : "Follow") + "</button></div>"; },
  async toggleFollow(id, following) { if (following) await SupabaseSync.client.from("follows").delete().eq("follower_id", this.user.id).eq("following_id", id); else { const { count } = await SupabaseSync.client.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", id); if ((count || 0) >= 5000) return this.status("Akun tersebut sudah mencapai batas maksimal 5.000 pengikut."); const { error } = await SupabaseSync.client.from("follows").insert({ follower_id: this.user.id, following_id: id }); if (error) return this.status(error.message); } await this.refreshFollowing(); await this.loadSocialStats(); this.search(); },
  async refreshFollowing() { if (!this.user) return; const { data: follows } = await SupabaseSync.client.from("follows").select("following_id").eq("follower_id", this.user.id); this.followingIds = (follows || []).map((x) => x.following_id); const el = document.getElementById("followingList"); if (!el) return; if (!this.followingIds.length) { el.innerHTML = "<p class='muted'>Belum mengikuti pengguna lain.</p>"; return; } const { data: profiles } = await SupabaseSync.client.from("profiles").select("id,display_name,bio,role,vessel_name,vessel_cargo,avatar_url").in("id", this.followingIds); const { data: locations } = await SupabaseSync.client.from("user_locations").select("user_id,lat,lon,speed_knots,heading,accuracy_m,updated_at").in("user_id", this.followingIds); (locations || []).forEach((row) => { const p = (profiles || []).find((x) => x.id === row.user_id); if (p && typeof MapApp !== "undefined" && MapApp.updateRemotePosition) MapApp.updateRemotePosition({ ...row, vessel_id: row.user_id, display_name: p.display_name }); }); el.innerHTML = (profiles || []).map((p) => this.friendRow(p, true)).join(""); el.querySelectorAll("[data-follow]").forEach((b) => b.addEventListener("click", () => this.toggleFollow(b.dataset.follow, true))); if (typeof SupabaseSync !== "undefined") SupabaseSync.friendIds = this.followingIds; },
  async loadSocialStats() { if (!this.user) return; const [followers, following] = await Promise.all([SupabaseSync.client.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", this.user.id), SupabaseSync.client.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", this.user.id)]); const fc = document.getElementById("followersCount"), nc = document.getElementById("followingCount"); if (fc) fc.textContent = followers.count || 0; if (nc) nc.textContent = following.count || 0; const { data } = await SupabaseSync.client.from("follows").select("follower_id").eq("following_id", this.user.id); const ids = (data || []).map((x) => x.follower_id); const { data: profiles } = ids.length ? await SupabaseSync.client.from("profiles").select("id,display_name,bio,role,vessel_name").in("id", ids) : { data: [] }; const el = document.getElementById("followersList"); if (el) el.innerHTML = (profiles || []).map((p) => this.friendRow(p, this.followingIds.includes(p.id))).join("") || "<p class='muted'>Belum ada pengikut.</p>"; el?.querySelectorAll("[data-follow]").forEach((b) => b.addEventListener("click", () => this.toggleFollow(b.dataset.follow, b.dataset.state === "true"))); },
  escape(v) { return String(v || "").replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])); }
};
