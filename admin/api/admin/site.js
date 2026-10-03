import { requireWebsiteOwner } from '../_lib/websiteAdmin.js';
import { serviceRest, serviceStorage, supabaseUrl } from '../_lib/supabase.js';
import { rateLimit } from '../_lib/rateLimit.js';

const MEDIA_BUCKETS = ['site-assets','blog-images','social-videos','social-audio'];

function configuredSiteKey() {
  return String(process.env.SITE_KEY || 'template').trim() || 'template';
}

function requestSiteKey(req) {
  return String(req.query?.site || req.body?.siteKey || configuredSiteKey()).trim();
}

function assertSite(req,res) {
  const requested = requestSiteKey(req);
  const configured = configuredSiteKey();
  if (requested !== configured) {
    res.status(404).json({ error:'Not found' });
    return null;
  }
  return configured;
}

async function jsonResponse(response, fallback='Request failed') {
  const payload = await response.json().catch(()=>null);
  if (!response.ok) {
    const message = payload?.message || payload?.error || payload?.hint || fallback;
    throw new Error(message);
  }
  return payload;
}

async function selectOne(table, filters) {
  const response = await serviceRest(`${table}?${filters}&limit=1`, { method:'GET' });
  const rows = await jsonResponse(response,`Unable to load ${table}`);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function upsert(table, row, onConflict) {
  const response = await serviceRest(`${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method:'POST',
    headers:{ Prefer:'resolution=merge-duplicates,return=representation' },
    body:JSON.stringify(row),
  });
  const rows = await jsonResponse(response,`Unable to save ${table}`);
  return Array.isArray(rows) ? rows[0] || row : row;
}

async function listMedia() {
  const result = [];
  for (const bucket of MEDIA_BUCKETS) {
    const response = await serviceStorage(`object/list/${bucket}`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ prefix:'', limit:1000, offset:0, sortBy:{ column:'created_at', order:'desc' } }),
    });
    if (!response.ok) continue;
    const rows = await response.json().catch(()=>[]);
    for (const row of Array.isArray(rows) ? rows : []) {
      if (!row?.name || row.name === '.emptyFolderPlaceholder') continue;
      const ext = String(row.name).split('.').pop()?.toLowerCase() || '';
      const mediaType = ['mp4','mov','webm','m4v'].includes(ext) ? 'video'
        : ['mp3','wav','m4a','aac','ogg'].includes(ext) ? 'audio'
        : 'image';
      const encoded = String(row.name).split('/').map(encodeURIComponent).join('/');
      result.push({
        bucket,
        path:row.name,
        name:row.name.split('/').pop(),
        mediaType,
        createdAt:row.created_at || row.updated_at || '',
        updatedAt:row.updated_at || '',
        size:Number(row.metadata?.size || 0),
        url:`${supabaseUrl()}/storage/v1/object/public/${bucket}/${encoded}`,
      });
    }
  }
  return result.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
}

function blogRow(input,siteKey) {
  const now=new Date().toISOString();
  const published = input.status === 'published';
  return {
    ...(input.id ? { id:input.id } : {}),
    site_key:siteKey,
    title:String(input.title||'').trim(),
    slug:String(input.slug||'').trim(),
    excerpt:String(input.excerpt||''),
    seo_title:String(input.seo_title ?? input.seoTitle ?? ''),
    seo_description:String(input.seo_description ?? input.seoDescription ?? ''),
    category:String(input.category||'General'),
    tags:Array.isArray(input.tags)?input.tags:[],
    featured_image:String(input.featured_image ?? input.featuredImage ?? ''),
    body:String(input.body||''),
    status:published?'published':'draft',
    author_name:String(input.author_name ?? input.authorName ?? 'Business Name'),
    published_at:published ? (input.published_at ?? input.publishedAt ?? now) : null,
    updated_at:now,
  };
}

function videoRow(input,siteKey) {
  return {
    ...(input.id ? { id:input.id } : {}),
    site_key:siteKey,
    title:String(input.title||''),
    youtube_url:String(input.youtubeUrl ?? input.youtube_url ?? ''),
    youtube_id:String(input.youtubeId ?? input.youtube_id ?? ''),
    description:String(input.description||''),
    placement:String(input.placement||'homepage'),
    sort_order:Number(input.sortOrder ?? input.sort_order ?? 0),
    status:input.status === 'hidden' ? 'hidden' : 'active',
    content_type:(input.contentType ?? input.content_type) === 'short' ? 'short' : 'video',
    playlist_name:String(input.playlistName ?? input.playlist_name ?? 'Website'),
    updated_at:new Date().toISOString(),
  };
}

async function handlePage(req,res,siteKey) {
  const pageId=String(req.query?.pageId || req.body?.pageId || '');
  if (!pageId) return res.status(400).json({ error:'Missing page ID.' });

  if (req.method === 'GET') {
    const key=`site_key=eq.${encodeURIComponent(siteKey)}&page_id=eq.${encodeURIComponent(pageId)}&select=*`;
    const [draft,published]=await Promise.all([
      selectOne('site_page_drafts',key),
      selectOne('site_pages',key),
    ]);
    return res.status(200).json({ draft,published });
  }

  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed.' });
  const content=req.body?.content;
  if (!content || !Array.isArray(content.content)) return res.status(400).json({ error:'Invalid page content.' });

  const now=new Date().toISOString();
  const base={
    site_key:siteKey,
    page_id:pageId,
    path:String(req.body?.path||`/${pageId}`),
    title:String(req.body?.title||pageId),
    content,
    updated_at:now,
  };
  const draft=await upsert('site_page_drafts',base,'site_key,page_id');
  let published=null;
  if (req.body?.action === 'publish') {
    published=await upsert('site_pages',{...base,published_at:now},'site_key,page_id');
  }
  return res.status(200).json({ draft,published });
}

async function handleSettingLike(req,res,siteKey,settingKey) {
  if (req.method === 'GET') {
    const row=await selectOne('site_settings',`site_key=eq.${encodeURIComponent(siteKey)}&setting_key=eq.${encodeURIComponent(settingKey)}&select=*`);
    return res.status(200).json({ value:row?.value ?? null, updatedAt:row?.updated_at || '' });
  }
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed.' });
  const value=req.body?.value;
  const row=await upsert('site_settings',{
    site_key:siteKey,
    setting_key:settingKey,
    value:value ?? {},
    updated_at:new Date().toISOString(),
  },'site_key,setting_key');
  return res.status(200).json({ value:row?.value ?? value, updatedAt:row?.updated_at || '' });
}

async function handleSocial(req,res,siteKey) {
  if (req.method === 'GET') {
    const row=await selectOne('site_settings',`site_key=eq.${encodeURIComponent(siteKey)}&setting_key=eq.social_links&select=*`);
    return res.status(200).json({ social:row?.value || {} });
  }
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed.' });
  const social=req.body?.social || {};
  const row=await upsert('site_settings',{site_key:siteKey,setting_key:'social_links',value:social,updated_at:new Date().toISOString()},'site_key,setting_key');
  return res.status(200).json({ social:row?.value || social });
}

async function handleVideos(req,res,siteKey) {
  if (req.method === 'GET') {
    const response=await serviceRest(`site_videos?site_key=eq.${encodeURIComponent(siteKey)}&select=*&order=sort_order.asc,created_at.asc`,{method:'GET'});
    return res.status(200).json({ videos:await jsonResponse(response,'Unable to load videos') });
  }
  if (req.method === 'DELETE') {
    const id=String(req.query?.id||'');
    if(!id)return res.status(400).json({error:'Missing video ID.'});
    const response=await serviceRest(`site_videos?id=eq.${encodeURIComponent(id)}&site_key=eq.${encodeURIComponent(siteKey)}`,{method:'DELETE'});
    await jsonResponse(response,'Unable to delete video');
    return res.status(200).json({ok:true});
  }
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed.' });
  const row=videoRow(req.body||{},siteKey);
  let saved;
  if(row.id) saved=await upsert('site_videos',row,'id');
  else {
    const response=await serviceRest('site_videos',{
      method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(row),
    });
    const rows=await jsonResponse(response,'Unable to save video');
    saved=rows?.[0]||row;
  }
  return res.status(200).json({video:saved});
}

async function handleBlog(req,res,siteKey) {
  if(req.method==='GET'){
    const response=await serviceRest(`blog_posts?site_key=eq.${encodeURIComponent(siteKey)}&select=*&order=updated_at.desc`,{method:'GET'});
    return res.status(200).json({posts:await jsonResponse(response,'Unable to load blog posts')});
  }
  if(req.method==='DELETE'){
    const id=String(req.query?.id||'');
    if(!id)return res.status(400).json({error:'Missing article ID.'});
    const response=await serviceRest(`blog_posts?id=eq.${encodeURIComponent(id)}&site_key=eq.${encodeURIComponent(siteKey)}`,{method:'DELETE'});
    await jsonResponse(response,'Unable to delete article');
    return res.status(200).json({ok:true});
  }
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
  const row=blogRow(req.body||{},siteKey);
  let saved;
  if(row.id)saved=await upsert('blog_posts',row,'id');
  else{
    const response=await serviceRest('blog_posts',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(row)});
    const rows=await jsonResponse(response,'Unable to save article');
    saved=rows?.[0]||row;
  }
  return res.status(200).json({post:saved});
}

async function handleMedia(req,res) {
  if(req.method==='GET')return res.status(200).json({media:await listMedia()});
  if(req.method!=='DELETE')return res.status(405).json({error:'Method not allowed.'});
  const bucket=String(req.query?.bucket||'');
  const path=String(req.query?.path||'');
  if(!MEDIA_BUCKETS.includes(bucket)||!path)return res.status(400).json({error:'Invalid media item.'});
  const encoded=path.split('/').map(encodeURIComponent).join('/');
  const response=await serviceStorage(`object/${bucket}/${encoded}`,{method:'DELETE'});
  if(!response.ok&&response.status!==404)await jsonResponse(response,'Unable to delete media');
  return res.status(200).json({ok:true});
}

async function handleRequests(req,res,siteKey) {
  if(req.method==='GET'){
    const response=await serviceRest(`service_requests?site_key=eq.${encodeURIComponent(siteKey)}&select=*&order=created_at.desc`,{method:'GET'});
    return res.status(200).json({requests:await jsonResponse(response,'Unable to load service requests')});
  }
  if(req.method==='DELETE'){
    const id=String(req.query?.id||'');
    if(!id)return res.status(400).json({error:'Missing request ID.'});
    const response=await serviceRest(`service_requests?id=eq.${encodeURIComponent(id)}&site_key=eq.${encodeURIComponent(siteKey)}`,{method:'DELETE'});
    await jsonResponse(response,'Unable to delete service request');
    return res.status(200).json({ok:true});
  }
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
  const id=String(req.body?.id||'');
  const changes=req.body?.changes||{};
  if(!id)return res.status(400).json({error:'Missing request ID.'});
  const allowed={};
  ['status','internal_note'].forEach(key=>{if(key in changes)allowed[key]=changes[key];});
  allowed.updated_at=new Date().toISOString();
  const response=await serviceRest(`service_requests?id=eq.${encodeURIComponent(id)}&site_key=eq.${encodeURIComponent(siteKey)}&select=*`,{
    method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(allowed),
  });
  const rows=await jsonResponse(response,'Unable to update service request');
  return res.status(200).json({request:rows?.[0]||null});
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(!rateLimit(req,res,{key:'site-admin',limit:120,windowMs:60_000}))return;
  const user=await requireWebsiteOwner(req,res);
  if(!user)return;
  const siteKey=assertSite(req,res);
  if(!siteKey)return;

  try{
    const resource=String(req.query?.resource||'');
    if(resource==='page')return await handlePage(req,res,siteKey);
    if(resource==='styles')return await handleSettingLike(req,res,siteKey,'global_styles');
    if(resource==='global'){
      const key=String(req.query?.key||req.body?.key||'');
      if(!['header','footer','project-request'].includes(key))return res.status(400).json({error:'Invalid global section.'});
      return await handleSettingLike(req,res,siteKey,`global_${key}`);
    }
    if(resource==='social')return await handleSocial(req,res,siteKey);
    if(resource==='videos')return await handleVideos(req,res,siteKey);
    if(resource==='blog')return await handleBlog(req,res,siteKey);
    if(resource==='media')return await handleMedia(req,res);
    if(resource==='setting'){
      const key=String(req.query?.key||req.body?.key||'');
      if(!/^[a-z0-9_-]{1,80}$/i.test(key))return res.status(400).json({error:'Invalid setting key.'});
      return await handleSettingLike(req,res,siteKey,key);
    }
    if(resource==='service-requests')return await handleRequests(req,res,siteKey);
    return res.status(404).json({error:'Unknown admin resource.'});
  }catch(error){
    console.error('Website admin API failed.',error);
    return res.status(500).json({error:error.message||'Website admin request failed.'});
  }
}
