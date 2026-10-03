import { readPublic, SITE_KEY } from './supabase';

export const DEFAULT_HEADER = {
  logo: '',
  brand: 'Business Name',
  brandFirst: 'Business',
  brandSecond: 'Name',
  brandFirstColor: '#0B1F33',
  brandSecondColor: '#2F6BFF',
  nav1Label: 'Home', nav1Url: '/',
  nav2Label: 'About', nav2Url: '/about',
  nav3Label: 'Services', nav3Url: '/services',
  nav4Label: 'Blog', nav4Url: '/blog',
  nav5Label: 'Contact', nav5Url: '/contact',
  nav6Label: '', nav6Url: '',
  nav7Label: '', nav7Url: '',
  buttonText: '', buttonUrl: '',
  socialIconColor: '#415162',
  socialIconBackground: '#ffffff',
  socialIconBorder: '#DCE4EC',
  socialIconHoverColor: '#ffffff',
  socialIconHoverBackground: '#2F6BFF',
  background: 'white',
};

export const DEFAULT_FOOTER = {
  logo: '',
  brand: 'Business Name',
  tagline: 'Add your business tagline.',
  column1Title: 'Explore',
  link1Label: 'Home', link1Url: '/',
  link2Label: 'About', link2Url: '/about',
  link3Label: 'Services', link3Url: '/services',
  link4Label: 'Blog', link4Url: '/blog',
  column2Title: 'Connect',
  link5Label: 'Contact', link5Url: '/contact',
  link6Label: '', link6Url: '',
  link7Label: '', link7Url: '',
  link8Label: '', link8Url: '',
  socialTitle: 'Connect',
  socialText: 'Follow us for updates.',
  copyright: 'Business Name. All rights reserved.',
  privacyLabel: 'Privacy', privacyUrl: '/privacy',
  termsLabel: 'Terms', termsUrl: '/terms',
  socialIconColor: '#ffffff',
  socialIconBackground: 'rgba(255,255,255,.04)',
  socialIconBorder: 'rgba(255,255,255,.18)',
  socialIconHoverColor: '#ffffff',
  socialIconHoverBackground: '#2F6BFF',
  background: 'dark',
};

export const DEFAULT_STYLES = {
  primary: '#1f67b2',
  primaryDark: '#185892',
  text: '#202223',
  muted: '#5c6268',
  pageBackground: '#f7f8fa',
  surface: '#ffffff',
  lightSurface: '#eef5fc',
  border: '#dfe3e8',
  darkSurface: '#111b27',
  headingFont: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  bodyFont: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1Size: 64,
  h2Size: 48,
  h3Size: 36,
  h4Size: 24,
  contentWidth: 1180,
  sectionSpacing: 76,
  cardRadius: 14,
  buttonRadius: 8,
  buttonHeight: 40,
};

export function normalizeStyles(value = {}) {
  return {
    ...DEFAULT_STYLES,
    ...(value || {}),
    h1Size: Number(value?.h1Size || DEFAULT_STYLES.h1Size),
    h2Size: Number(value?.h2Size || DEFAULT_STYLES.h2Size),
    h3Size: Number(value?.h3Size || DEFAULT_STYLES.h3Size),
    h4Size: Number(value?.h4Size || DEFAULT_STYLES.h4Size),
    contentWidth: Number(value?.contentWidth || DEFAULT_STYLES.contentWidth),
    sectionSpacing: Number(value?.sectionSpacing || DEFAULT_STYLES.sectionSpacing),
    cardRadius: Number(value?.cardRadius || DEFAULT_STYLES.cardRadius),
    buttonRadius: Number(value?.buttonRadius || DEFAULT_STYLES.buttonRadius),
    buttonHeight: Number(value?.buttonHeight || DEFAULT_STYLES.buttonHeight),
  };
}

export function styleVars(value = {}) {
  const s = normalizeStyles(value);
  return {
    '--site-primary': s.primary,
    '--site-primary-dark': s.primaryDark,
    '--site-text': s.text,
    '--site-muted': s.muted,
    '--site-page-bg': s.pageBackground,
    '--site-surface': s.surface,
    '--site-light-surface': s.lightSurface,
    '--site-border': s.border,
    '--site-dark-surface': s.darkSurface,
    '--site-heading-font': s.headingFont,
    '--site-body-font': s.bodyFont,
    '--site-h1-size': `${s.h1Size}px`,
    '--site-h2-size': `${s.h2Size}px`,
    '--site-h3-size': `${s.h3Size}px`,
    '--site-h4-size': `${s.h4Size}px`,
    '--site-content-width': `${s.contentWidth}px`,
    '--site-section-space': `${s.sectionSpacing}px`,
    '--site-card-radius': `${s.cardRadius}px`,
    '--site-button-radius': `${s.buttonRadius}px`,
    '--site-button-height': `${s.buttonHeight}px`,
  };
}

export async function loadSetting(key, fallback) {
  try {
    const rows = await readPublic(
      'site_settings',
      `select=value&site_key=eq.${encodeURIComponent(SITE_KEY)}&setting_key=eq.${encodeURIComponent(key)}&limit=1`
    );
    const raw = rows[0]?.value || {};
    const value = raw?.content?.[0]?.props || raw;
    return { ...fallback, ...(value || {}) };
  } catch {
    return fallback;
  }
}

export async function loadGlobalStyles() {
  return normalizeStyles(await loadSetting('global_styles', DEFAULT_STYLES));
}

export async function loadPublishedPage(pageId) {
  const rows = await readPublic(
    'site_pages',
    `select=page_id,path,title,content,published_at&site_key=eq.${encodeURIComponent(SITE_KEY)}&page_id=eq.${encodeURIComponent(pageId)}&limit=1`
  );
  return rows[0] || null;
}

export async function loadBlogPosts() {
  return readPublic(
    'blog_posts',
    `select=*&site_key=eq.${encodeURIComponent(SITE_KEY)}&status=eq.published&order=published_at.desc`
  );
}

export async function loadBlogPost(slug) {
  const rows = await readPublic(
    'blog_posts',
    `select=*&site_key=eq.${encodeURIComponent(SITE_KEY)}&status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  return rows[0] || null;
}
