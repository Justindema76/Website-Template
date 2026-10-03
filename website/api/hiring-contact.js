const clean = (value, max = 1000) => String(value ?? '').trim().slice(0, max);
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const body = req.body || {};
  if (clean(body.company_services, 200)) return res.status(200).json({ ok: true });

  const record = {
    site_key: process.env.SITE_KEY || 'template',
    name: clean(body.name, 120),
    company: clean(body.company, 160),
    email: clean(body.email, 254).toLowerCase(),
    phone: clean(body.phone, 60),
    website_or_linkedin: clean(body.website_or_linkedin, 500),
    reason: clean(body.reason, 80),
    role_title: clean(body.role_title, 180),
    message: clean(body.message, 6000),
    employment_consent: body.employment_consent === true,
    status: 'new',
  };

  if (!record.name || !record.company || !validEmail(record.email) || !record.role_title || record.message.length < 30 || !record.employment_consent) {
    return res.status(400).json({ message: 'Please complete the required contact fields.' });
  }

  const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  if (!url || !key) return res.status(500).json({ message: 'Server database environment is not configured.' });

  try {
    const response = await fetch(`${url}/rest/v1/hiring_contacts`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(record),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.message || 'Unable to save contact.');
    const saved = Array.isArray(payload) ? payload[0] : payload;
    return res.status(201).json({ ok: true, request_id: saved?.id || null });
  } catch (error) {
    console.error('Contact submission failed.', error);
    return res.status(500).json({ message: 'Unable to send your message right now.' });
  }
}
