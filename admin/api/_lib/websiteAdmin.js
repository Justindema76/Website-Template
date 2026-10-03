import { getUserFromToken } from './supabase.js';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function identityProviders(user) {
  const providers = new Set();
  const primary = String(user?.app_metadata?.provider || '').trim().toLowerCase();
  if (primary) providers.add(primary);

  if (Array.isArray(user?.app_metadata?.providers)) {
    user.app_metadata.providers.forEach(provider => {
      const value = String(provider || '').trim().toLowerCase();
      if (value) providers.add(value);
    });
  }

  if (Array.isArray(user?.identities)) {
    user.identities.forEach(identity => {
      const value = String(identity?.provider || '').trim().toLowerCase();
      if (value) providers.add(value);
    });
  }

  return providers;
}

export function isWebsiteOwner(user) {
  const ownerEmail = normalizeEmail(process.env.ADMIN_OWNER_EMAIL);
  return Boolean(ownerEmail)
    && normalizeEmail(user?.email) === ownerEmail
    && identityProviders(user).has('google');
}

export async function requireWebsiteOwner(req, res) {
  const authorization = String(req.headers.authorization || '');
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const user = await getUserFromToken(token);

  res.setHeader('Cache-Control', 'no-store');

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  if (!isWebsiteOwner(user)) {
    res.status(404).json({ error: 'Not found' });
    return null;
  }

  return { ...user, accessToken: token };
}
