// Cloudflare Pages Function: POST /api/ask
// Gives the Ask MarketCentaur widget a written answer grounded in /assets/catalog.json.
// Off until you add ANTHROPIC_API_KEY in Cloudflare Pages → Settings → Environment variables.
// Without the key it returns 503 and the widget falls back to catalog matching in the browser.

const MODEL = 'claude-haiku-5-5';
const MAX_QUESTION = 400;

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'not configured' }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad request' }, 400); }
  const question = String(body.question || '').slice(0, MAX_QUESTION).trim();
  if (!question) return json({ error: 'empty question' }, 400);
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  let catalog = '';
  try {
    const res = await env.ASSETS.fetch(new URL('/assets/catalog.json', request.url));
    const data = await res.json();
    catalog = data.practices.map((p) => `${p.name}: ${p.offers.map((o) => `${o.name} (${o.type}) - ${o.summary}`).join(' | ')}`).join('\n');
  } catch { /* answer without the catalog text */ }

  const system = [
    'You are the website assistant for MarketCentaur, an AI-led digital transformation consultancy that works with any business, of any size, anywhere.',
    'Recommend at most three services from the catalog below that fit the visitor\'s need, by their exact names, in two to four short sentences of plain English.',
    'Never state, estimate or hint at prices, rates, discounts or budgets. If asked about cost, say pricing is tailored to the scope and the visitor can request a quote, answered within one business day.',
    'Do not invent services, clients, results or statistics. Do not give legal, financial or medical advice. If unsure, suggest the free AI Readiness Score or talking to a person.',
    'Catalog:', catalog,
  ].join('\n');

  const messages = [
    ...history.filter((h) => h && h.text).map((h) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.text).slice(0, 800) })),
  ];
  if (!messages.length || messages[messages.length - 1].role !== 'user') messages.push({ role: 'user', content: question });
  while (messages.length && messages[0].role !== 'user') messages.shift();

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: env.ASSISTANT_MODEL || MODEL, max_tokens: 300, system, messages }),
    });
    if (!r.ok) return json({ error: 'upstream' }, 502);
    const data = await r.json();
    let answer = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    // Last line of defence for the no-prices rule.
    if (/[$€£₹]\s?\d|\b(USD|INR|EUR|GBP)\s?\d|\d+\s?% off/i.test(answer)) {
      answer = 'Pricing is tailored to your scope, so we don\'t publish prices. Request a quote and we\'ll reply within one business day.';
    }
    return json({ answer });
  } catch {
    return json({ error: 'upstream' }, 502);
  }
}

export function onRequest() {
  return json({ error: 'method not allowed' }, 405);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
