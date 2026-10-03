const LiveSync = {
  socket: null,
  base: localStorage.getItem("bs10_api") || "",
  publishPosition(payload) {
    if (!this.base) return;
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) this.connect();
    if (this.socket && this.socket.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify({ type: "position", vesselId: localStorage.getItem("bs10_vessel_id") || "kapal-utama", payload, at: new Date().toISOString() }));
  },
  connect() {
    if (!this.base) return;
    try { this.socket = new WebSocket(this.base.replace(/^http/, "ws") + "/telemetry"); this.socket.onopen = () => { document.getElementById("syncState").textContent = "Sinkronisasi online aktif"; }; this.socket.onclose = () => { document.getElementById("syncState").textContent = "Mode lokal • menunggu server"; }; } catch (_) {}
  }
};
