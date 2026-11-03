// Twilio Voice webhook stub: when a call is missed, texts back in the caller's language.
// SAFE BY DEFAULT: only sends if MISSED_CALL_TEXTBACK=on and Twilio env vars exist.
// Compliance: a text-back to someone who just called is generally treated as a one-time, informational response;
// confirm with counsel and register an A2P 10DLC campaign that describes it before turning on.
const T = {
  es: 'Hola, perdón que no contestamos. Le regresamos la llamada pronto. Agende aquí: {LINK} . Responda STOP para no recibir mensajes.',
  en: 'Sorry we missed your call! We will call you back soon. Book a time: {LINK} . Reply STOP to opt out.',
  pa: 'ਮਾਫ਼ ਕਰਨਾ, ਅਸੀਂ ਤੁਹਾਡੀ ਕਾਲ ਨਹੀਂ ਚੁੱਕ ਸਕੇ। ਅਸੀਂ ਜਲਦੀ ਵਾਪਸ ਕਾਲ ਕਰਾਂਗੇ। ਸਮਾਂ ਬੁੱਕ ਕਰੋ: {LINK} . ਬੰਦ ਕਰਨ ਲਈ STOP ਭੇਜੋ।'
};
export default async function handler(req, res) {
  let p = req.body || {};
  if (typeof p === 'string') p = Object.fromEntries(new URLSearchParams(p));
  p = { ...req.query, ...p };
  // Language: Twilio <Gather> digit (1=ES, 2=EN, 3=PA) or ?lang=; default Spanish.
  const lang = { '1': 'es', '2': 'en', '3': 'pa' }[p.Digits] || (['es', 'en', 'pa'].includes(p.lang) ? p.lang : 'es');
  const body = T[lang].replace('{LINK}', process.env.BOOKING_LINK || 'https://example.com/book');
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: tok, TWILIO_FROM: from, MISSED_CALL_TEXTBACK } = process.env;
  const to = p.From;
  let sent = false;
  if (MISSED_CALL_TEXTBACK === 'on' && sid && tok && from && /^\+1\d{10}$/.test(to || '')) {
    try {
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${tok}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: to, From: from, Body: body })
      }); sent = r.ok;
    } catch {}
  }
  if (req.method === 'GET' && !p.From) return res.status(200).json({ ok: true, mode: sent ? 'live' : 'demo', lang, preview: body });
  res.setHeader('Content-Type', 'text/xml');
  const say = { es: 'Gracias por llamar. Le enviaremos un mensaje de texto y le regresaremos la llamada pronto.', en: 'Thanks for calling. We will text you and call you back soon.', pa: 'Thanks for calling. We will text you and call you back soon.' }[lang];
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say language="${lang === 'es' ? 'es-MX' : 'en-US'}">${say}</Say></Response>`);
}
