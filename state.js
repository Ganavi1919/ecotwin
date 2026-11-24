// Dashboard polls this. Readings older than 60 s are dropped so hardware bins fall back to simulation.
const { db, cors } = require('./_lib');
module.exports = (req, res) => {
  cors(res);
  const now = Date.now(), readings = {};
  for (const [id, v] of Object.entries(db.readings)) if (now - v.at < 60000) readings[id] = v;
  res.json({ readings, reports: db.reports.length, time: now });
};
