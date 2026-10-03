import { supabaseAnon, supabaseUrl } from '../_lib/supabase.js';
import { isWebsiteOwner, requireWebsiteOwner } from '../_lib/websiteAdmin.js';
import { rateLimit } from '../_lib/rateLimit.js';

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Admin',
    avatar: user.user_metadata?.avatar_url || '',
    isAdmin: true,
  };
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (!rateLimit(req,res,{key:'admin-auth',limit:30,windowMs:60_000})) return;

  const sessionMode = String(req.query?.session || '') === '1';
  const provider = String(req.query?.provider || '');

  if (sessionMode) {
    const user = await requireWebsiteOwner(req,res);
    if (!user) return;
    return res.status(200).json({ user: publicUser(user) });
  }

  if (req.method !== 'GET' || provider !== 'google') {
    return res.status(400).json({ error:'Google sign-in is required.' });
  }

  const appUrl = String(process.env.APP_URL || '').replace(/\/$/,'');
  if (!appUrl) return res.status(500).json({ error:'APP_URL is not configured.' });

  const callback = String(req.query?.callback || '/admin-login');
  const safeCallback = callback.startsWith('/') ? callback : '/admin-login';
  const redirectTo = `${appUrl}${safeCallback}`;
  const authorize = new URL(`${supabaseUrl()}/auth/v1/authorize`);
  authorize.searchParams.set('provider','google');
  authorize.searchParams.set('redirect_to',redirectTo);

  return res.redirect(302,authorize.toString());
}
