// EcoTwin AI: Claude answers from the live snapshot plus recent chat history.
// Without ANTHROPIC_API_KEY it returns mode "rules" and the browser answers locally.
const { cors } = require('./_lib');
module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const { q, bins = [], trucks = 0, history = [] } = req.body || {};
  if (!q) return res.status(400).json({ error: 'ask a question' });
  if (!process.env.ANTHROPIC_API_KEY) return res.json({ mode: 'rules' });
  let hist = (Array.isArray(history) ? history : []).slice(-6).map(m => ({ role: m.r === 'u' ? 'user' : 'assistant', content: String(m.t || '').slice(0, 600) }));
  while (hist.length && hist[0].role !== 'user') hist.shift();
  hist = hist.filter((m, i) => !i || m.role !== hist[i - 1].role);
  if (hist.length && hist[hist.length - 1].role === 'user') hist.pop();
  const snap = JSON.stringify({ trucks, bins: bins.slice(0, 60).map(b => ({ id: b.id, zone: b.zone, type: b.type, fill: Math.round(b.fill), temp: Math.round(b.temp) })) });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5',
        max_tokens: 500,
        system: 'You are EcoTwin AI, the assistant of a smart waste management digital twin. Use the live snapshot for questions about current bins, zones, trucks and routes. Also answer general waste, recycling, circular economy and smart-city questions. Be concise (under 110 words), concrete, plain text without headings.',
        messages: [...hist, { role: 'user', content: `Live snapshot: ${snap}\n\nQuestion: ${String(q).slice(0, 400)}` }],
      }),
    });
    const j = await r.json();
    const text = j.content && j.content[0] && j.content[0].text;
    res.json(text ? { answer: text, mode: 'claude' } : { mode: 'rules' });
  } catch (e) { res.json({ mode: 'rules' }); }
};
