export const SOCIAL_NETWORKS = [
  { key:'facebook', label:'Facebook', icon:'' },
  { key:'instagram', label:'Instagram', icon:'' },
  { key:'linkedin', label:'LinkedIn', icon:'' },
  { key:'github', label:'GitHub', icon:'' },
  { key:'youtube', label:'YouTube', icon:'' },
  { key:'tiktok', label:'TikTok', icon:'' },
];

export const FALLBACK_VIDEOS = [];

export function emptySocialLinks() {
  return Object.fromEntries(SOCIAL_NETWORKS.map(({ key }) => [key, { url:'', enabled:true }]));
}

export function normalizeVideo(row = {}) {
  const youtubeUrl = row.youtube_url ?? row.youtubeUrl ?? '';
  const inferredType = /youtube\.com\/shorts\//i.test(youtubeUrl) ? 'short' : 'video';
  return {
    id: row.id || '',
    title: row.title || '',
    youtubeUrl,
    youtubeId: row.youtube_id ?? row.youtubeId ?? '',
    description: row.description || '',
    placement: row.placement || 'homepage',
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    status: row.status === 'hidden' ? 'hidden' : 'active',
    contentType: (row.content_type ?? row.contentType ?? inferredType) === 'short' ? 'short' : 'video',
    playlistName: String(row.playlist_name ?? row.playlistName ?? 'Website').trim() || 'Website',
    createdAt: row.created_at ?? row.createdAt ?? '',
    updatedAt: row.updated_at ?? row.updatedAt ?? '',
  };
}
