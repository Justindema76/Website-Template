import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Image, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../../auth/AdminAuthContext';
import { deleteAdminMedia, loadAdminMedia, uploadBlogImage } from '../../services/siteAdminService';

export default function MediaAdmin(){
  const {accessToken}=useAuth();
  const [items,setItems]=useState([]);
  const [q,setQ]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [copied,setCopied]=useState('');

  const refresh=async()=>{setBusy(true);setError('');try{setItems(await loadAdminMedia(accessToken));}catch(err){setError(err.message);}finally{setBusy(false);}};
  useEffect(()=>{if(accessToken) refresh();},[accessToken]);

  const filtered=useMemo(()=>{const term=q.trim().toLowerCase();return !term?items:items.filter(item=>`${item.name} ${item.bucket} ${item.mediaType}`.toLowerCase().includes(term));},[items,q]);

  const upload=async event=>{
    const files=Array.from(event.target.files||[]);
    if(!files.length)return;
    setBusy(true);setError('');
    try{for(const file of files) await uploadBlogImage(accessToken,file); await refresh();}
    catch(err){setError(err.message||'Unable to upload media.');}
    finally{setBusy(false);event.target.value='';}
  };

  const copy=async item=>{await navigator.clipboard.writeText(item.url);setCopied(item.path);setTimeout(()=>setCopied(''),1500);};
  const remove=async item=>{
    if(!window.confirm(`Delete "${item.name}"?`))return;
    setBusy(true);setError('');
    try{await deleteAdminMedia(accessToken,item);await refresh();}
    catch(err){setError(err.message||'Unable to delete media.');}
    finally{setBusy(false);}
  };

  return <div>
    <div className="site-admin-page-head">
      <div><p className="site-admin-eyebrow">Content</p><h1>Media</h1><p>Upload and reuse website images.</p></div>
      <label className="site-admin-btn"><Upload size={14}/> Upload Images<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={upload} hidden/></label>
    </div>
    {error&&<div className="site-admin-alert error">{error}</div>}
    <div className="site-admin-card"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search media…"/></div>
    <div className="site-admin-media-grid">
      {filtered.map(item=><article className="site-admin-card" key={`${item.bucket}:${item.path}`}>
        <div className="site-admin-media-preview">{item.url?<img src={item.url} alt={item.name}/>:<Image size={28}/>}</div>
        <strong>{item.name}</strong><small>{item.bucket}</small>
        <div className="site-admin-actions">
          <button className="site-admin-btn secondary small" type="button" onClick={()=>copy(item)}>{copied===item.path?<Check size={13}/>:<Copy size={13}/>} Copy URL</button>
          <button className="site-admin-btn danger small" type="button" onClick={()=>remove(item)}><Trash2 size={13}/> Delete</button>
        </div>
      </article>)}
    </div>
    {!busy&&!filtered.length&&<div className="site-admin-card"><p>No media uploaded yet.</p></div>}
  </div>;
}
