// Citizen tickets. In-memory per warm instance; swap for Supabase/Upstash to persist.
const { db, cors } = require('./_lib');
module.exports = (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') return res.json({ reports: db.reports.slice(0, 50) });
  if (req.method !== 'POST') return res.status(405).json({ error: 'GET or POST only' });
  const { bin, type, note } = req.body || {};
  if (!/^B\d+$/.test(bin || '')) return res.status(400).json({ error: 'valid bin id required' });
  const t = { id: 'T-' + (1000 + db.reports.length + 1), bin, type: String(type || 'Overflowing').slice(0, 30), note: String(note || '').slice(0, 280), at: Date.now() };
  db.reports.unshift(t);
  res.status(201).json(t);
};
