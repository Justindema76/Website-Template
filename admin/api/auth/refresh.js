import { supabaseAnon, supabaseUrl } from '../_lib/supabase.js';
import { isWebsiteOwner } from '../_lib/websiteAdmin.js';
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
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).json({ error:'Method not allowed.' });
  }
  if (!rateLimit(req,res,{key:'admin-refresh',limit:30,windowMs:60_000})) return;

  const refreshToken = String(req.body?.refreshToken || '');
  if (!refreshToken) return res.status(400).json({ error:'Missing refresh token.' });

  const response = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=refresh_token`, {
    method:'POST',
    headers:{
      apikey:supabaseAnon(),
      'Content-Type':'application/json',
    },
    body:JSON.stringify({ refresh_token:refreshToken }),
  });

  const payload = await response.json().catch(()=>({}));
  if (!response.ok || !payload.access_token || !payload.user) {
    return res.status(401).json({ error:'Admin session expired.' });
  }

  if (!isWebsiteOwner(payload.user)) {
    return res.status(404).json({ error:'Not found' });
  }

  return res.status(200).json({
    user:publicUser(payload.user),
    accessToken:payload.access_token,
    refreshToken:payload.refresh_token || refreshToken,
  });
}
