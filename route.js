// Nearest-neighbour tour improved with 2-opt. Body: {depot:{x,y}, bins:[{id,x,y}]}
const { cors, dist } = require('./_lib');
const len = p => p.reduce((s, a, i) => (i ? s + dist(p[i - 1], a) : 0), 0);
module.exports = (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const { depot, bins } = req.body || {};
  if (!depot || !Array.isArray(bins)) return res.status(400).json({ error: 'depot and bins required' });
  const left = bins.slice(0, 60);
  let path = [depot], cur = depot;
  while (left.length) { left.sort((a, b) => dist(cur, a) - dist(cur, b)); cur = left.shift(); path.push(cur); }
  path.push(depot);
  const nn = len(path);
  for (let imp = true; imp;) {
    imp = false;
    for (let i = 1; i < path.length - 2; i++) for (let j = i + 1; j < path.length - 1; j++) {
      const c = path.slice(0, i).concat(path.slice(i, j + 1).reverse(), path.slice(j + 1));
      if (len(c) < len(path) - 1e-9) { path = c; imp = true; }
    }
  }
  res.json({ path: path.map(({ id, x, y }) => ({ id, x, y })), nnKm: nn * 0.04, optKm: len(path) * 0.04 });
};
