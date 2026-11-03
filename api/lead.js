// POST /api/lead — validates a lead, logs consent, optionally sends ONE confirmation SMS (only if consented + Twilio env vars set).
const MSG = {
  es: n => `Hola ${n}, recibimos su solicitud. Le llamaremos hoy mismo. Responda STOP para cancelar, HELP para ayuda. Pueden aplicar tarifas de mensajes y datos.`,
  en: n => `Hi ${n}, we got your request and will call you today. Reply STOP to opt out, HELP for help. Msg & data rates may apply.`,
  pa: n => `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${n}, ਤੁਹਾਡੀ ਬੇਨਤੀ ਮਿਲ ਗਈ ਹੈ। ਅਸੀਂ ਅੱਜ ਹੀ ਕਾਲ ਕਰਾਂਗੇ। ਬੰਦ ਕਰਨ ਲਈ STOP, ਮਦਦ ਲਈ HELP ਭੇਜੋ।`
};
const clean = (s, n = 120) => String(s ?? '').replace(/[<>]/g, '').trim().slice(0, n);
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  if (b.website) return res.status(200).json({ ok: true }); // honeypot: silently drop bots
  const name = clean(b.name, 80), phone = String(b.phone || '').replace(/\D/g, '');
  const lang = ['es', 'en', 'pa'].includes(b.lang) ? b.lang : 'es';
  const e164 = phone.length === 10 ? '+1' + phone : phone.length === 11 && phone[0] === '1' ? '+' + phone : null;
  if (!name || !e164) return res.status(400).json({ ok: false, error: 'name_and_valid_us_phone_required' });
  const consent = {
    smsConsent: b.smsConsent === true, consentText: clean(b.consentText, 600),
    timestamp: new Date().toISOString(), source: clean(b.source || 'website-lead-form', 60), lang,
    ip: (req.headers['x-forwarded-for'] || '').split(',')[0], userAgent: clean(req.headers['user-agent'], 200)
  };
  const lead = { name, phone: e164, lang, reason: clean(b.reason, 40), day: clean(b.day, 20), time: clean(b.time, 20), notes: clean(b.notes, 300), consent };
  console.log('LEAD', JSON.stringify(lead)); // consent log -> Vercel logs. Replace with a real DB for 10-year retention.
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: tok, TWILIO_FROM: from } = process.env;
  if (!consent.smsConsent || !sid || !tok || !from) return res.status(200).json({ ok: true, mode: 'demo', smsSent: false, consentLogged: consent.timestamp });
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${tok}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: e164, From: from, Body: MSG[lang](name.split(' ')[0]) })
    });
    return res.status(200).json({ ok: true, mode: 'live', smsSent: r.ok, consentLogged: consent.timestamp });
  } catch (e) { return res.status(200).json({ ok: true, mode: 'live', smsSent: false }); }
}
