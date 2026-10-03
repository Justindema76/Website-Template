const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
export const SITE_KEY = String(import.meta.env.VITE_SITE_KEY || 'template');

export async function readPublic(table, query = 'select=*') {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const payload = await response.json().catch(() => []);
  if (!response.ok) throw new Error(payload?.message || 'Unable to load website content');
  return Array.isArray(payload) ? payload : [];
}
