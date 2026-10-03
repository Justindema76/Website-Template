import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE = String(import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
const SITE_NAME = String(import.meta.env.VITE_SITE_NAME || 'Business Name');
const DEFAULT_DESCRIPTION = String(import.meta.env.VITE_SITE_DESCRIPTION || 'Add your website description.');

function upsertMeta(name, content, property = false) {
  const key = property ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${key}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  if (!href) return;
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function SEO() {
  const location = useLocation();

  useEffect(() => {
    const raw = location.pathname === '/' ? '' : location.pathname.split('/').filter(Boolean).pop() || '';
    const label = raw ? raw.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : SITE_NAME;
    const title = raw ? `${label} | ${SITE_NAME}` : SITE_NAME;
    const canonical = BASE ? `${BASE}${location.pathname === '/' ? '/' : location.pathname}` : '';

    document.title = title;
    upsertMeta('description', DEFAULT_DESCRIPTION);
    upsertMeta('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    upsertMeta('og:site_name', SITE_NAME, true);
    upsertMeta('og:title', title, true);
    upsertMeta('og:description', DEFAULT_DESCRIPTION, true);
    upsertMeta('og:type', location.pathname.startsWith('/blog/') ? 'article' : 'website', true);
    if (canonical) upsertMeta('og:url', canonical, true);
    upsertMeta('twitter:card', 'summary');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', DEFAULT_DESCRIPTION);
    setCanonical(canonical);
  }, [location.pathname]);

  return null;
}
