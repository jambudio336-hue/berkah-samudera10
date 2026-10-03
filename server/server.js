import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
const vessels = new Map();
app.use(cors()); app.use(express.json({ limit: "32kb" }));
app.get("/health", (_req, res) => res.json({ ok: true, service: "berkah-samudera10", realtime: true, time: new Date().toISOString() }));
app.get("/api/vessels", (_req, res) => res.json([...vessels.values()]));
app.post("/api/vessels/:id/position", (req, res) => { const item = { vesselId: req.params.id, ...req.body, updatedAt: new Date().toISOString() }; vessels.set(req.params.id, item); broadcast({ type: "position", ...item }); res.status(202).json(item); });
function broadcast(data) { const msg = JSON.stringify(data); wss.clients.forEach((client) => { if (client.readyState === 1) client.send(msg); }); }
wss.on("connection", (socket) => { socket.send(JSON.stringify({ type: "snapshot", vessels: [...vessels.values()] })); socket.on("message", (raw) => { try { const msg = JSON.parse(raw); if (msg.type === "position" && msg.vesselId && msg.payload?.lat != null) { const item = { vesselId: msg.vesselId, ...msg.payload, updatedAt: msg.at || new Date().toISOString() }; vessels.set(msg.vesselId, item); broadcast({ type: "position", ...item }); } } catch (_) {} }); });
server.on("upgrade", (request, socket, head) => { if (new URL(request.url, "http://localhost").pathname !== "/telemetry") return socket.destroy(); wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, request)); });
const port = Number(process.env.PORT || 8787); server.listen(port, "0.0.0.0", () => console.log(`Berkah Samudera10 API listening on :${port}`));
