import template from './template/config';

export const SITE_CONFIGS = Object.freeze({
  [template.key]: template,
});

export function getSiteConfig() {
  return template;
}

export function getAllowedPaths() {
  return new Set(template.navGroups.flatMap(group => group.items.map(item => item.to)));
}
