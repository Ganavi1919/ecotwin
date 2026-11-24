// Real IoT sensors (ESP32, Arduino, curl) POST here: {"id":"B100","fill":97,"temp":31}
const { db, cors } = require('./_lib');
module.exports = (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.INGEST_KEY;
  if (key && req.headers['x-api-key'] !== key) return res.status(401).json({ error: 'bad api key' });
  const list = Array.isArray(req.body) ? req.body : [req.body];
  let n = 0;
  for (const r of list) {
    if (r && /^B\d+$/.test(r.id) && r.fill >= 0 && r.fill <= 100) {
      db.readings[r.id] = { fill: +r.fill, temp: r.temp != null ? +r.temp : null, at: Date.now() };
      n++;
    }
  }
  res.json({ accepted: n });
};
