export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).send("OK");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    console.log("LW payload:", JSON.stringify(body, null, 2));
    return res.status(200).json({
      received: true,
      keys: Object.keys(body),
      message: "Webhook radi ✔️"
    });
  } catch (error) {
    console.error("Parse error:", error);
    return res.status(400).json({ error: "Invalid JSON", details: String(error) });
  }
}
