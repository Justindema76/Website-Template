const buckets = globalThis.__websiteTemplateRateBuckets || new Map();
globalThis.__websiteTemplateRateBuckets = buckets;

export function rateLimit(req, res, { key='default', limit=20, windowMs=60_000 } = {}) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const id = `${key}:${ip}`;
  const now = Date.now();
  const current = buckets.get(id);
  const next = !current || now >= current.resetAt
    ? { count:1, resetAt:now + windowMs }
    : { ...current, count:current.count + 1 };
  buckets.set(id,next);

  if (next.count > limit) {
    res.setHeader('Retry-After', String(Math.max(1,Math.ceil((next.resetAt-now)/1000))));
    res.status(429).json({ error:'Too many requests. Try again shortly.' });
    return false;
  }

  return true;
}
