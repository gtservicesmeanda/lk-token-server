import { AccessToken } from "livekit-server-sdk";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const { roomName, identity, canPublish = false, canSubscribe = true } = req.body || {};
    if (!roomName || !identity) {
      return res.status(400).json({ error: "roomName and identity are required" });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_WS_URL;
    if (!apiKey || !apiSecret || !wsUrl) {
      return res.status(500).json({ error: "Server missing LiveKit env vars" });
    }

    const at = new AccessToken(apiKey, apiSecret, { identity });
    at.addGrant({ room: roomName, roomJoin: true, canPublish, canSubscribe });
    const token = await at.toJwt();

    return res.status(200).json({ token, wsUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Token error" });
  }
}
