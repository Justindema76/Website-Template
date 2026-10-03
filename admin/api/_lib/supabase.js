const required = name => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

export const supabaseUrl = () => String(required('SUPABASE_URL')).replace(/\/$/, '');
export const supabaseAnon = () => required('SUPABASE_ANON_KEY');
export const supabaseServiceKey = () => required('SUPABASE_SERVICE_ROLE_KEY');

export async function serviceRest(path, options = {}) {
  const key = supabaseServiceKey();
  return fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

export async function serviceStorage(path, options = {}) {
  const key = supabaseServiceKey();
  return fetch(`${supabaseUrl()}/storage/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(options.headers || {}),
    },
  });
}

export async function getUserFromToken(token) {
  if (!token) return null;
  const response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnon(),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}
