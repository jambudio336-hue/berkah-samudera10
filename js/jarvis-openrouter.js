(() => {
  "use strict";
  const CFG = {
    key: "bs10_jarvis_cfg_v2",
    legacy: "bs10_jarvis_cfg_v1",
    history: "bs10_jarvis_history_v2",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    models: "https://openrouter.ai/api/v1/models",
    router: "openrouter/free",
    cache: "bs10_jarvis_models_v1"
  };
  const $ = (id) => document.getElementById(id);
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (_) { return fallback; }
  };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function cfg() {
    const stored = read(CFG.key, null);
    const legacy = stored ? {} : read(CFG.legacy, {});
    return {
      apiKey: "",
      enabled: false,
      voiceRate: 1.05,
      voicePitch: 1.1,
      model: CFG.router,
      autoModel: true,
      continuous: false,
      voiceURI: "",
      voiceOnly: true,
      shareLocation: false,
      ...legacy,
      ...(stored || {})
    };
  }

  let recognition = null;
  let listening = false;
  let speaking = false;
  let busy = false;

  function mapState() {
    const map = window.MapApp || {};
    return {
      lat: map.lat ?? null,
      lon: map.lon ?? null,
      sogKnot: Number(map.speedKmh || 0) / 1.852 || 0,
      heading: map.heading ?? null,
      accuracy: map.accuracy ?? null,
      depth: map.depth ?? null
    };
  }

  function localContext() {
    const counts = {};
    ["tangkapan", "kolekting", "bbm", "logistik"].forEach((type) => {
      try {
        const rows = typeof Store !== "undefined" ? Store.load(type) : [];
        counts[type] = Array.isArray(rows) ? rows.length : 0;
      } catch (_) { counts[type] = 0; }
    });
    let safetyCompleted = 0;
    try {
      const now = new Date();
      const day = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
      const checks = JSON.parse(localStorage.getItem(`bs10_safety_checklist_${day}`) || "{}");
      safetyCompleted = Object.values(checks).filter(Boolean).length;
    } catch (_) {}
    return { recordCounts: counts, safetyChecklistItemsDoneToday: safetyCompleted };
  }

  function domContext() {
    const ids = ["marineSpeed", "marineHeading", "marineDepth", "dashSpeed", "dashWave", "dashDepth", "dashReef", "gpsState", "kpiGps", "kpiTrack", "kpiRecords", "kpiSync", "statusNet", "marineNetwork", "nativeTrackingStatus"];
    const snapshot = {};
    ids.forEach((id) => {
      const element = $(id);
      if (element) snapshot[id] = (element.textContent || "").trim().slice(0, 300);
    });
    return snapshot;
  }

  function context() {
    const livePosition = mapState();
    if (!cfg().shareLocation) {
      livePosition.lat = null;
      livePosition.lon = null;
    }
    const snapshot = {
      app: { name: "Berkah Samudera10", version: "1.1.0", ai: "Kiplay" },
      live: {
        network: navigator.onLine,
        gnss: livePosition,
        screen: document.querySelector(".page.active")?.id || null,
        time: new Date().toISOString(),
        ui: domContext()
      },
      capabilities: (window.MarineOS?.modules || []).map((item) => ({ id: item[0], name: item[2], description: item[3] })),
      providers: window.MarineOS?.providers || {},
      integrations: (window.MarineOS?.worldIntegrations || []).map((item) => ({ id: item.id, name: item.name, status: item.status })),
      localDataSummary: localContext()
    };
    if (window.MarineRuntime?.getState) {
      try { snapshot.runtime = window.MarineRuntime.getState(); } catch (_) {}
    }
    return snapshot;
  }

  function recommendations() {
    const state = mapState();
    const result = [];
    if (!navigator.onLine) result.push("Koneksi offline; gunakan cache lokal dan verifikasi data online.");
    if (!Number.isFinite(state.lat)) result.push("GNSS belum siap; aktifkan lokasi sebelum berangkat.");
    if (Number.isFinite(state.accuracy) && state.accuracy > 100) result.push("Akurasi GNSS rendah; verifikasi dengan alat navigasi lain.");
    if (state.sogKnot > 0) result.push("Kapal bergerak; pertahankan lookout dan pantau rute.");
    if (!result.length) result.push("Periksa cuaca, kedalaman, dan checklist sebelum berlayar.");
    return result;
  }

  function prompt() {
    return "Kamu Kiplay, asisten suara Bahasa Indonesia untuk Berkah Samudera10. Panggil pengguna Captain. Gunakan snapshot aplikasi yang disediakan untuk menjelaskan fitur, kondisi kapal, dan rekomendasi. Jangan mengarang AIS, radar, kedalaman, cuaca, posisi, harga, atau data kapal; jika kosong atau stale, katakan terus terang. Kamu hanya decision-support, bukan pengganti nahkoda, lookout, radar/AIS tersertifikasi, peta laut resmi, atau prosedur keselamatan. Jangan meminta atau mengungkap API key/token/password, dan jangan menjalankan tindakan berisiko. Untuk keadaan darurat, arahkan pengguna mengikuti prosedur keselamatan setempat dan menghubungi layanan darurat maritim. Jawab singkat, jelas, ramah, dan nyaman dibacakan suara.";
  }

  function status(text) {
    const element = $("jarvisStatus");
    if (element) element.textContent = text;
    const marine = $("marineJarvisStatus");
    if (marine) marine.textContent = text.replace(/^[^ ]+ /, "");
  }

  function availableVoices() {
    try { return "speechSynthesis" in window ? speechSynthesis.getVoices() : []; }
    catch (_) { return []; }
  }

  function renderVoices() {
    const select = $("jarvisVoice");
    if (!select) return;
    const selected = cfg().voiceURI || "";
    const voices = availableVoices().slice().sort((a, b) => {
      const aId = /^id(-|_)/i.test(a.lang) ? 0 : 1;
      const bId = /^id(-|_)/i.test(b.lang) ? 0 : 1;
      return aId - bId || a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name);
    });
    select.innerHTML = '<option value="">Kiplay • Bahasa Indonesia otomatis</option>' + voices.map((voice) =>
      `<option value="${esc(voice.voiceURI)}">${esc(voice.name)} (${esc(voice.lang)})</option>`
    ).join("");
    select.value = voices.some((voice) => voice.voiceURI === selected) ? selected : "";
  }

  function speak(text) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      status("🟡 Suara TTS tidak tersedia di perangkat ini. Aktifkan teks balasan atau pasang voice pack Bahasa Indonesia.");
      return;
    }
    const spoken = String(text || "").replace(/[*#_`]/g, "").trim();
    if (!spoken) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spoken);
    const config = cfg();
    const voices = availableVoices();
    const chosen = voices.find((voice) => voice.voiceURI === config.voiceURI)
      || voices.find((voice) => /^id(-|_)/i.test(voice.lang))
      || null;
    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang || "id-ID";
    } else {
      utterance.lang = "id-ID";
    }
    utterance.rate = Math.min(1.5, Math.max(0.6, Number(config.voiceRate) || 1.05));
    utterance.pitch = Math.min(1.5, Math.max(0.7, Number(config.voicePitch) || 1.1));
    utterance.onstart = () => { speaking = true; };
    utterance.onerror = () => { speaking = false; };
    utterance.onend = () => {
      speaking = false;
      if (config.continuous && $("jarvisVoiceToggle")?.checked) setTimeout(startListening, 450);
    };
    if (listening && recognition) {
      try { recognition.stop(); } catch (_) {}
      listening = false;
      updateMic();
    }
    speechSynthesis.speak(utterance);
  }

  function renderHistory() {
    const element = $("jarvisConversation");
    if (!element) return;
    const history = read(CFG.history, []).slice(-8);
    element.innerHTML = history.length
      ? history.map((item) => {
        const isUser = item.role === "user";
        const text = isUser ? item.content : (cfg().voiceOnly ? "Balasan dibacakan oleh Kiplay." : item.content);
        return `<div class="jarvis-message ${isUser ? "user" : "assistant"}"><b>${isUser ? "Captain" : "Kiplay"}</b><span>${esc(text)}</span></div>`;
      }).join("")
      : '<p class="muted">Kiplay akan menjawab lewat suara.</p>';
    element.scrollTop = element.scrollHeight;
  }

  function freeModels() { return read(CFG.cache, { models: [] }).models || []; }

  function renderModels(models = freeModels()) {
    const select = $("jarvisModel");
    if (!select) return;
    const chosen = cfg().model || CFG.router;
    const options = [{ id: CFG.router, name: "OpenRouter Free Router (otomatis)" }, ...models.filter((item) => item.id !== CFG.router).slice(0, 24)];
    select.innerHTML = options.map((item) => `<option value="${esc(item.id)}">${esc(item.name || item.id)}</option>`).join("");
    select.value = options.some((item) => item.id === chosen) ? chosen : CFG.router;
  }

  async function discoverFreeModels(silent = false) {
    const config = cfg();
    if (!config.apiKey) {
      if (!silent) status("⚪ Isi API key OpenRouter untuk mencari model gratis.");
      return [];
    }
    try {
      const response = await fetch(CFG.models, { headers: { Authorization: `Bearer ${config.apiKey}` }, cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      const models = (body.data || [])
        .filter((model) => String(model.id).includes(":free") || (Number(model.pricing?.prompt) === 0 && Number(model.pricing?.completion) === 0))
        .map((model) => ({ id: model.id, name: model.name || model.id }))
        .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
      save(CFG.cache, { at: Date.now(), models });
      renderModels(models);
      if (!silent) status(`🟢 ${models.length} model gratis ditemukan; router siap.`);
      return models;
    } catch (error) {
      renderModels();
      if (!silent) status(`🟡 Daftar model belum tersedia: ${error.message}`);
      return [];
    }
  }

  async function ask(text) {
    const question = String(text || "").trim();
    if (!question || busy) return;
    const config = cfg();
    if (!config.enabled) {
      status("⚪ Kiplay nonaktif. Aktifkan Kiplay terlebih dahulu.");
      speak("Kiplay masih nonaktif, Captain. Aktifkan Kiplay terlebih dahulu.");
      return;
    }
    if (!config.apiKey) {
      status("🔴 API key OpenRouter belum diisi.");
      speak("API key OpenRouter belum diisi, Captain.");
      return;
    }
    busy = true;
    status("🟡 Kiplay membaca ringkasan aplikasi…");
    const history = read(CFG.history, []).slice(-8);
    const messages = [
      { role: "system", content: prompt() },
      { role: "system", content: `SNAPSHOT APLIKASI READ-ONLY:\n${JSON.stringify(context())}\nREKOMENDASI LOKAL:\n${recommendations().join("\n")}` },
      ...history,
      { role: "user", content: question }
    ];
    try {
      const response = await fetch(CFG.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
          "HTTP-Referer": location.origin,
          "X-Title": "Berkah Samudera10 Kiplay"
        },
        body: JSON.stringify({ model: config.model || CFG.router, messages, temperature: 0.25, max_tokens: 450 })
      });
      if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
      const body = await response.json();
      const answer = body?.choices?.[0]?.message?.content?.trim();
      if (!answer) throw new Error("Jawaban kosong");
      save(CFG.history, [...history, { role: "user", content: question }, { role: "assistant", content: answer, at: Date.now() }].slice(-16));
      renderHistory();
      status(`🟢 Kiplay aktif • ${config.model || CFG.router}`);
      speak(answer);
    } catch (error) {
      console.error("Kiplay", error);
      status(`🔴 Kiplay gagal: ${error.message}`);
      speak("Maaf Captain, Kiplay gagal menjawab. Periksa koneksi, model, dan API key OpenRouter.");
    } finally {
      busy = false;
    }
  }

  function updateMic() {
    const button = $("btnJarvisMic");
    if (button) button.textContent = listening ? "🎙️ Kiplay mendengar…" : "🎙️ Bicara dengan Kiplay";
  }

  function startListening() {
    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionApi) {
      status("🟡 Pengenalan suara tidak tersedia di WebView ini.");
      speak("Pengenalan suara belum didukung di perangkat ini, Captain.");
      return;
    }
    if (listening || speaking) return;
    recognition = new SpeechRecognitionApi();
    recognition.lang = "id-ID";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => {
      listening = true;
      updateMic();
      status("🎙️ Kiplay mendengarkan. Awali pertanyaan dengan Kiplay atau Jarvis.");
    };
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (!event.results[index].isFinal) continue;
        const transcript = event.results[index][0].transcript.trim();
        if (/(kiplay|jarvis)/i.test(transcript)) {
          const question = transcript.replace(/\b(hai|halo|hei|oke)?\s*(kiplay|jarvis)\b/ig, "").trim();
          if (question) ask(question);
          else speak("Siap, Captain. Kiplay mendengarkan.");
        }
      }
    };
    recognition.onerror = (event) => {
      listening = false;
      updateMic();
      status(`🔴 Kesalahan pengenalan suara: ${event.error}`);
    };
    recognition.onend = () => {
      listening = false;
      updateMic();
      if (!speaking && $("jarvisVoiceToggle")?.checked && cfg().enabled) setTimeout(startListening, 650);
    };
    try { recognition.start(); } catch (_) {}
  }

  function stopListening() {
    try { recognition?.stop(); } catch (_) {}
    listening = false;
    speaking = false;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    updateMic();
    status("⚪ Kiplay standby.");
  }

  function saveConfig() {
    const old = cfg();
    const next = {
      ...old,
      apiKey: $("jarvisApiKey")?.value.trim() || "",
      enabled: !!$("jarvisEnabled")?.checked,
      voiceRate: Math.min(1.5, Math.max(0.6, Number($("jarvisRate")?.value) || 1.05)),
      voicePitch: Math.min(1.5, Math.max(0.7, Number($("jarvisPitch")?.value) || 1.1)),
      voiceURI: $("jarvisVoice")?.value || "",
      voiceOnly: !$("jarvisVoiceOnly")?.checked,
      shareLocation: !!$("jarvisShareLocation")?.checked,
      model: $("jarvisModel")?.value || CFG.router,
      autoModel: !!$("jarvisAutoModel")?.checked,
      continuous: !!$("jarvisVoiceToggle")?.checked
    };
    save(CFG.key, next);
    renderHistory();
    status(next.enabled && next.apiKey ? "🟢 Kiplay aktif; kunci disimpan di perangkat." : "⚪ Kiplay tersimpan dalam mode standby.");
    if (next.enabled && next.apiKey) discoverFreeModels(true);
  }

  function renderConfig() {
    const config = cfg();
    if ($("jarvisApiKey")) $("jarvisApiKey").value = config.apiKey || "";
    if ($("jarvisEnabled")) $("jarvisEnabled").checked = !!config.enabled;
    if ($("jarvisRate")) $("jarvisRate").value = config.voiceRate || 1.05;
    if ($("jarvisPitch")) $("jarvisPitch").value = config.voicePitch || 1.1;
    if ($("jarvisVoiceToggle")) $("jarvisVoiceToggle").checked = !!config.continuous;
    if ($("jarvisVoiceOnly")) $("jarvisVoiceOnly").checked = config.voiceOnly === false;
    if ($("jarvisShareLocation")) $("jarvisShareLocation").checked = !!config.shareLocation;
    if ($("jarvisAutoModel")) $("jarvisAutoModel").checked = config.autoModel !== false;
    renderModels();
    renderVoices();
    status(config.enabled && config.apiKey ? `🟢 Kiplay siap • ${config.model || CFG.router}` : "⚪ Aktifkan Kiplay dan masukkan API key OpenRouter");
    renderHistory();
  }

  function bind() {
    $("btnJarvisSave")?.addEventListener("click", saveConfig);
    $("btnJarvisDiscover")?.addEventListener("click", () => discoverFreeModels(false));
    $("btnJarvisMic")?.addEventListener("click", startListening);
    $("btnJarvisStop")?.addEventListener("click", stopListening);
    $("btnJarvisTest")?.addEventListener("click", () => ask("Jelaskan status kapal dan rekomendasi keselamatan saya sekarang."));
    $("btnJarvisClear")?.addEventListener("click", () => {
      localStorage.removeItem(CFG.history);
      renderHistory();
      status("🧹 Riwayat Kiplay dihapus.");
    });
    $("jarvisAsk")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const input = event.currentTarget;
        ask(input.value);
        input.value = "";
      }
    });
    $("btnJarvisAsk")?.addEventListener("click", () => {
      const input = $("jarvisAsk");
      ask(input.value);
      input.value = "";
    });
    $("jarvisVoiceToggle")?.addEventListener("change", (event) => {
      const config = cfg();
      config.continuous = event.target.checked;
      save(CFG.key, config);
      event.target.checked ? startListening() : stopListening();
    });
    $("jarvisVoiceOnly")?.addEventListener("change", (event) => {
      const config = cfg();
      config.voiceOnly = !event.target.checked;
      save(CFG.key, config);
      renderHistory();
    });
    $("jarvisShareLocation")?.addEventListener("change", (event) => {
      const config = cfg();
      if (event.target.checked && !confirm("Izinkan koordinat GPS terkini ikut dikirim ke OpenRouter setiap kali Anda bertanya kepada Kiplay?")) {
        event.target.checked = false;
        return;
      }
      config.shareLocation = event.target.checked;
      save(CFG.key, config);
    });
    $("jarvisEnabled")?.addEventListener("change", (event) => {
      if (!event.target.checked) stopListening();
    });
    if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = renderVoices;
    renderConfig();
  }

  window.Jarvis = { ask, startListening, stopListening, speak, context, recommendations, discoverFreeModels, saveConfig };
  document.addEventListener("DOMContentLoaded", bind);
})();
