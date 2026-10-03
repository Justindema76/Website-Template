import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AdminAuthContext';
import { deleteAdminVideo, loadAdminVideos, saveAdminVideo } from '../../services/siteAdminService';

const emptyVideo={id:'',title:'',youtubeUrl:'',description:'',placement:'homepage',sortOrder:1,status:'active',contentType:'video',playlistName:'Website'};

export default function VideosAdmin(){
  const {accessToken}=useAuth();
  const {id}=useParams();
  const navigate=useNavigate();
  const editing=Boolean(id);
  const [videos,setVideos]=useState([]);
  const [draft,setDraft]=useState(emptyVideo);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');

  const refresh=async()=>{const rows=await loadAdminVideos(accessToken);setVideos(rows);return rows;};
  useEffect(()=>{if(!accessToken)return;setBusy(true);refresh().catch(err=>setError(err.message)).finally(()=>setBusy(false));},[accessToken]);
  useEffect(()=>{if(!editing)return;if(id==='new'){setDraft(emptyVideo);return;}const current=videos.find(video=>String(video.id)===String(id));if(current)setDraft(current);},[editing,id,videos]);

  const sorted=useMemo(()=>[...videos].sort((a,b)=>(a.placement||'').localeCompare(b.placement||'')||(a.sortOrder||0)-(b.sortOrder||0)),[videos]);
  const update=(key,value)=>setDraft(current=>({...current,[key]:value}));

  const save=async event=>{
    event.preventDefault();setBusy(true);setError('');setMessage('');
    try{await saveAdminVideo(accessToken,draft);await refresh();setMessage('Video saved.');navigate('/admin/videos');}
    catch(err){setError(err.message||'Unable to save video.');}
    finally{setBusy(false);}
  };
  const remove=async video=>{
    if(!window.confirm(`Delete "${video.title}"?`))return;
    setBusy(true);setError('');
    try{await deleteAdminVideo(accessToken,video.id);await refresh();}
    catch(err){setError(err.message||'Unable to delete video.');}
    finally{setBusy(false);}
  };

  if(editing)return <div>
    <div className="site-admin-page-head"><div><p className="site-admin-eyebrow">Content</p><h1>{id==='new'?'New Video':'Edit Video'}</h1></div><Link className="site-admin-btn secondary" to="/admin/videos">Back</Link></div>
    {error&&<div className="site-admin-alert error">{error}</div>}
    <form className="site-admin-card site-admin-form-grid" onSubmit={save}>
      <label>Title<input value={draft.title} onChange={e=>update('title',e.target.value)} required/></label>
      <label>YouTube URL<input value={draft.youtubeUrl} onChange={e=>update('youtubeUrl',e.target.value)} required/></label>
      <label>Placement<input value={draft.placement} onChange={e=>update('placement',e.target.value)}/></label>
      <label>Sort order<input type="number" value={draft.sortOrder} onChange={e=>update('sortOrder',Number(e.target.value))}/></label>
      <label>Playlist<input value={draft.playlistName} onChange={e=>update('playlistName',e.target.value)}/></label>
      <label>Status<select value={draft.status} onChange={e=>update('status',e.target.value)}><option value="active">Active</option><option value="hidden">Hidden</option></select></label>
      <label className="full">Description<textarea rows={5} value={draft.description} onChange={e=>update('description',e.target.value)}/></label>
      <div className="full"><button className="site-admin-btn" type="submit" disabled={busy}><Save size={14}/> Save Video</button></div>
    </form>
  </div>;

  return <div>
    <div className="site-admin-page-head"><div><p className="site-admin-eyebrow">Content</p><h1>Videos</h1><p>Manage YouTube videos used by the website.</p></div><Link className="site-admin-btn" to="/admin/videos/new"><Plus size={14}/> New Video</Link></div>
    {error&&<div className="site-admin-alert error">{error}</div>}
    {message&&<div className="site-admin-alert success">{message}</div>}
    <div className="site-admin-list">{sorted.map(video=><article className="site-admin-card" key={video.id}>
      <div><span className="site-admin-eyebrow">{video.status}</span><h2>{video.title}</h2><p>{video.placement} · {video.playlistName}</p></div>
      <div className="site-admin-actions"><Link className="site-admin-btn secondary" to={`/admin/videos/${video.id}`}>Edit</Link><button className="site-admin-btn danger" type="button" onClick={()=>remove(video)}><Trash2 size={14}/> Delete</button></div>
    </article>)}</div>
    {!busy&&!sorted.length&&<div className="site-admin-card"><p>No videos yet.</p></div>}
  </div>;
}
