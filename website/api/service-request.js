const MAX = {
  name: 120, email: 254, phone: 60, company: 160, website: 500,
  service: 120, budget: 80, timeline: 80, message: 6000, source_path: 500,
};

const clean = (value, field) => String(value ?? '').trim().slice(0, MAX[field] || 1000);
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function insertRecord(table, record) {
  const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  if (!url || !key) throw new Error('Server database environment is not configured.');

  const response = await fetch(`${url}/rest/v1/${table}`, {
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
  if (!response.ok) throw new Error(payload?.message || 'Unable to save request.');
  return Array.isArray(payload) ? payload[0] : payload;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const body = req.body || {};
  if (clean(body.fax_number, 'phone')) return res.status(200).json({ ok: true });

  const record = {
    site_key: process.env.SITE_KEY || 'template',
    name: clean(body.name, 'name'),
    email: clean(body.email, 'email').toLowerCase(),
    phone: clean(body.phone, 'phone'),
    company: clean(body.company, 'company'),
    website: clean(body.website, 'website'),
    requested_service: clean(body.service, 'service') || 'not_sure',
    budget_range: clean(body.budget, 'budget'),
    timeline: clean(body.timeline, 'timeline'),
    message: clean(body.message, 'message'),
    contact_consent: body.contact_consent === true,
    status: 'new',
    source_path: clean(body.source_path, 'source_path'),
    metadata: { submitted_via: 'website_template' },
  };

  if (!record.name || !validEmail(record.email) || record.message.length < 20 || !record.contact_consent) {
    return res.status(400).json({ message: 'Please complete the required fields.' });
  }

  try {
    const saved = await insertRecord('service_requests', record);
    return res.status(201).json({ ok: true, request_id: saved?.id || null });
  } catch (error) {
    console.error('Service request submission failed.', error);
    return res.status(500).json({ message: 'Unable to submit your request right now.' });
  }
}
