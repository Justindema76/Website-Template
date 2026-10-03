import { emptySocialLinks, normalizeVideo } from '../config/siteContent';
import { adminFetch, currentAccessToken, parseJsonResponse, refreshAdminAccessToken } from './apiClient';

const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
export const DEFAULT_ADMIN_SITE_KEY = String(import.meta.env.VITE_SITE_KEY || 'template');

const BUCKETS = {
  siteImage: 'site-assets',
  blogImage: 'blog-images',
  video: 'social-videos',
  audio: 'social-audio',
};

export function getAdminSiteKey() {
  return DEFAULT_ADMIN_SITE_KEY;
}

export function setAdminSiteKey() {}

export async function loadAdminSites() {
  return [{
    site_key: DEFAULT_ADMIN_SITE_KEY,
    name: 'Business Name',
    domain: String(import.meta.env.VITE_SITE_DOMAIN || 'example.com').replace(/^https?:\/\//,'').replace(/\/$/,''),
    admin_label: 'Client Website',
    is_active: true,
  }];
}

function siteAdminUrl(resource, params = {}) {
  const search = new URLSearchParams({ resource, site: getAdminSiteKey(), ...params });
  return `/api/admin/site?${search.toString()}`;
}

const parseResponse = response => parseJsonResponse(response, 'Website admin request failed');

function safeFilename(filename = 'file') {
  return String(filename || 'file').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
}

function publicMediaUrl(bucket, name) {
  const encoded = String(name || '').split('/').map(encodeURIComponent).join('/');
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encoded}`;
}

async function uploadPublicAsset(accessToken, file, { bucket, allowedTypes, maxBytes }) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) throw new Error('Supabase browser environment is not configured.');
  if (!file) throw new Error('Choose a file first.');
  const type = String(file.type || '').toLowerCase();
  if (!allowedTypes.has(type)) throw new Error('This file type is not supported.');
  if (!file.size) throw new Error('The selected file is empty.');
  if (file.size > maxBytes) throw new Error(`File must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller.`);

  const objectName = `${Date.now()}-${safeFilename(file.name)}`;
  const encodedName = objectName.split('/').map(encodeURIComponent).join('/');
  const upload = token => fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${encodedName}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': type || 'application/octet-stream',
      'x-upsert': 'false',
      'Cache-Control': '3600',
    },
    body: file,
  });

  let response = await upload(currentAccessToken(accessToken));
  if (response.status === 401) {
    const refreshed = await refreshAdminAccessToken();
    if (refreshed) response = await upload(refreshed);
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || payload.error || 'Upload failed.');
  }
  return publicMediaUrl(bucket, objectName);
}

export async function loadAdminSitePage(accessToken, pageId) {
  return parseResponse(await adminFetch(siteAdminUrl('page', { pageId }), {}, accessToken));
}

async function savePage(accessToken, page, content, action) {
  return parseResponse(await adminFetch(siteAdminUrl('page'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageId: page.id,
      path: page.path,
      title: page.title,
      content,
      action,
      siteKey: getAdminSiteKey(),
    }),
  }, accessToken));
}

export const saveAdminSitePageDraft = (accessToken, page, content) => savePage(accessToken, page, content, 'draft');
export const publishAdminSitePage = (accessToken, page, content) => savePage(accessToken, page, content, 'publish');

export async function loadAdminGlobalStyles(accessToken) {
  return parseResponse(await adminFetch(siteAdminUrl('styles'), {}, accessToken));
}

export async function saveAdminGlobalStyles(accessToken, value) {
  return parseResponse(await adminFetch(siteAdminUrl('styles'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, siteKey: getAdminSiteKey() }),
  }, accessToken));
}

export async function loadAdminGlobalSection(accessToken, key) {
  return parseResponse(await adminFetch(siteAdminUrl('global', { key }), {}, accessToken));
}

export async function saveAdminGlobalSection(accessToken, key, value) {
  return parseResponse(await adminFetch(siteAdminUrl('global'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, siteKey: getAdminSiteKey() }),
  }, accessToken));
}

export async function loadAdminSocial(accessToken) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('social'), {}, accessToken));
  return { ...emptySocialLinks(), ...(payload.social || {}) };
}

export async function saveAdminSocial(accessToken, social) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('social'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ social, siteKey: getAdminSiteKey() }),
  }, accessToken));
  return { ...emptySocialLinks(), ...(payload.social || {}) };
}

export async function loadAdminVideos(accessToken) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('videos'), {}, accessToken));
  return Array.isArray(payload.videos) ? payload.videos.map(normalizeVideo) : [];
}

export async function saveAdminVideo(accessToken, video) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('videos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...video, siteKey: getAdminSiteKey() }),
  }, accessToken));
  return normalizeVideo(payload.video || {});
}

export async function deleteAdminVideo(accessToken, id) {
  return parseResponse(await adminFetch(siteAdminUrl('videos', { id }), { method: 'DELETE' }, accessToken));
}

export async function loadAdminBlogPosts(accessToken) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('blog'), {}, accessToken));
  return Array.isArray(payload.posts) ? payload.posts : [];
}

export async function saveAdminBlogPost(accessToken, post) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('blog'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...post, siteKey: getAdminSiteKey() }),
  }, accessToken));
  return payload.post || null;
}

export async function deleteAdminBlogPost(accessToken, id) {
  return parseResponse(await adminFetch(siteAdminUrl('blog', { id }), { method: 'DELETE' }, accessToken));
}

export async function loadAdminMedia(accessToken) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('media'), {}, accessToken));
  return Array.isArray(payload.media) ? payload.media : [];
}

export async function deleteAdminMedia(accessToken, item) {
  return parseResponse(await adminFetch(siteAdminUrl('media', {
    bucket: item?.bucket || '',
    path: item?.path || '',
  }), { method: 'DELETE' }, accessToken));
}

export const uploadSiteImage = (accessToken, file) => uploadPublicAsset(accessToken, file, {
  bucket: BUCKETS.siteImage,
  allowedTypes: new Set(['image/jpeg','image/png','image/webp','image/gif']),
  maxBytes: 10 * 1024 * 1024,
});

export const uploadBlogImage = (accessToken, file) => uploadPublicAsset(accessToken, file, {
  bucket: BUCKETS.blogImage,
  allowedTypes: new Set(['image/jpeg','image/png','image/webp','image/gif']),
  maxBytes: 10 * 1024 * 1024,
});

export const uploadSocialVideo = (accessToken, file) => uploadPublicAsset(accessToken, file, {
  bucket: BUCKETS.video,
  allowedTypes: new Set(['video/mp4','video/quicktime','video/webm','video/x-m4v']),
  maxBytes: 100 * 1024 * 1024,
});

export const uploadSocialAudio = (accessToken, file) => uploadPublicAsset(accessToken, file, {
  bucket: BUCKETS.audio,
  allowedTypes: new Set(['audio/mpeg','audio/mp4','audio/wav','audio/aac','audio/ogg']),
  maxBytes: 25 * 1024 * 1024,
});

export async function loadAdminSetting(accessToken, key) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('setting', { key }), {}, accessToken));
  return payload.value || null;
}

export async function saveAdminSetting(accessToken, key, value) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('setting'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, siteKey: getAdminSiteKey() }),
  }, accessToken));
  return payload.value || value;
}

export async function loadAdminServiceRequests(accessToken) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('service-requests'), {}, accessToken));
  return Array.isArray(payload.requests) ? payload.requests : [];
}

export async function updateAdminServiceRequest(accessToken, id, changes) {
  const payload = await parseResponse(await adminFetch(siteAdminUrl('service-requests'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, changes, siteKey: getAdminSiteKey() }),
  }, accessToken));
  return payload.request || null;
}

export async function deleteAdminServiceRequest(accessToken, id) {
  return parseResponse(await adminFetch(siteAdminUrl('service-requests', { id }), { method: 'DELETE' }, accessToken));
}
