const g = globalThis;
g.__eco = g.__eco || { readings: {}, reports: [] };
module.exports = {
  db: g.__eco,
  cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-api-key');
  },
  dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
};
