export default async function handler(req, res) {
  const configuredRate = Number(process.env.CAMBIO_COMMERCIAL_RATE);
  if (!Number.isFinite(configuredRate) || configuredRate <= 0) {
    return res.status(503).json({ error: "commercial_rate_not_configured" });
  }
  const now = new Date();
  return res.status(200).json({
    rate: configuredRate,
    date: now.toISOString().slice(0, 10),
    updatedAt: now.toISOString(),
    source: "commercial_rate_configured_by_operator"
  });
}
