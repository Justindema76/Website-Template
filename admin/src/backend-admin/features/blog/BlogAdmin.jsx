import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Plus, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AdminAuthContext';
import { deleteAdminBlogPost, loadAdminBlogPosts, saveAdminBlogPost, uploadBlogImage } from '../../services/siteAdminService';

const emptyPost = {
  id:'', title:'', slug:'', excerpt:'', category:'General', tags:[],
  featured_image:'', body:'', seo_title:'', seo_description:'',
  status:'draft', author_name:'Business Name', published_at:'',
};

const slugify = value => String(value || '').toLowerCase().trim()
  .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');

function normalize(row = {}) {
  return {
    ...emptyPost,
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : [],
    featured_image: row.featured_image ?? row.featuredImage ?? '',
    seo_title: row.seo_title ?? row.seoTitle ?? '',
    seo_description: row.seo_description ?? row.seoDescription ?? '',
    author_name: row.author_name ?? row.authorName ?? 'Business Name',
  };
}

export default function BlogAdmin() {
  const { accessToken } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [posts,setPosts] = useState([]);
  const [draft,setDraft] = useState(emptyPost);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const [q,setQ] = useState('');

  const refresh = async () => {
    const rows = await loadAdminBlogPosts(accessToken);
    setPosts(rows.map(normalize));
    return rows;
  };

  useEffect(() => {
    if (!accessToken) return;
    setBusy(true);
    refresh().catch(err=>setError(err.message)).finally(()=>setBusy(false));
  },[accessToken]);

  useEffect(() => {
    if (!editing) return;
    if (id === 'new') { setDraft(emptyPost); return; }
    const current = posts.find(post => String(post.id) === String(id));
    if (current) setDraft(normalize(current));
  },[editing,id,posts]);

  const filtered = useMemo(() => {
    const term=q.trim().toLowerCase();
    return !term ? posts : posts.filter(post=>`${post.title} ${post.slug} ${post.category}`.toLowerCase().includes(term));
  },[posts,q]);

  const update=(key,value)=>setDraft(current=>({...current,[key]:value}));

  const save=async event=>{
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try{
      const payload={
        ...draft,
        slug:slugify(draft.slug || draft.title),
        tags:Array.isArray(draft.tags)?draft.tags:String(draft.tags||'').split(',').map(v=>v.trim()).filter(Boolean),
      };
      await saveAdminBlogPost(accessToken,payload);
      await refresh();
      setMessage('Article saved.');
      navigate('/admin/blog');
    }catch(err){setError(err.message||'Unable to save article.');}
    finally{setBusy(false);}
  };

  const remove=async post=>{
    if(!window.confirm(`Delete "${post.title}"?`)) return;
    setBusy(true); setError('');
    try{await deleteAdminBlogPost(accessToken,post.id); await refresh();}
    catch(err){setError(err.message||'Unable to delete article.');}
    finally{setBusy(false);}
  };

  const upload=async event=>{
    const file=event.target.files?.[0]; if(!file) return;
    setBusy(true); setError('');
    try{const url=await uploadBlogImage(accessToken,file); update('featured_image',url);}
    catch(err){setError(err.message||'Unable to upload image.');}
    finally{setBusy(false); event.target.value='';}
  };

  if(editing) return <div>
    <div className="site-admin-page-head">
      <div><p className="site-admin-eyebrow">Content</p><h1>{id==='new'?'New Article':'Edit Article'}</h1><p>Create search-friendly website content.</p></div>
      <Link className="site-admin-btn secondary" to="/admin/blog">Back to Blog</Link>
    </div>
    {error&&<div className="site-admin-alert error">{error}</div>}
    {message&&<div className="site-admin-alert success">{message}</div>}
    <form className="site-admin-card site-admin-form-grid" onSubmit={save}>
      <label>Title<input value={draft.title} onChange={e=>update('title',e.target.value)} required/></label>
      <label>Slug<input value={draft.slug} onChange={e=>update('slug',e.target.value)} placeholder={slugify(draft.title)}/></label>
      <label>Category<input value={draft.category} onChange={e=>update('category',e.target.value)}/></label>
      <label>Status<select value={draft.status} onChange={e=>update('status',e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></label>
      <label className="full">Excerpt<textarea value={draft.excerpt} onChange={e=>update('excerpt',e.target.value)} rows={3}/></label>
      <label className="full">Body<textarea value={draft.body} onChange={e=>update('body',e.target.value)} rows={14}/></label>
      <label className="full">Tags<input value={(draft.tags||[]).join(', ')} onChange={e=>update('tags',e.target.value.split(',').map(v=>v.trim()).filter(Boolean))}/></label>
      <label className="full">Featured image URL<input value={draft.featured_image} onChange={e=>update('featured_image',e.target.value)}/></label>
      <label>Upload featured image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload}/></label>
      <label>Author<input value={draft.author_name} onChange={e=>update('author_name',e.target.value)}/></label>
      <label className="full">SEO title<input value={draft.seo_title} onChange={e=>update('seo_title',e.target.value)}/></label>
      <label className="full">SEO description<textarea value={draft.seo_description} onChange={e=>update('seo_description',e.target.value)} rows={3}/></label>
      <div className="full site-admin-actions"><button className="site-admin-btn" type="submit" disabled={busy}><Save size={14}/> {busy?'Saving…':'Save Article'}</button></div>
    </form>
  </div>;

  return <div>
    <div className="site-admin-page-head">
      <div><p className="site-admin-eyebrow">Content</p><h1>Blog Posts</h1><p>Create, edit and publish website articles.</p></div>
      <Link className="site-admin-btn" to="/admin/blog/new"><Plus size={14}/> New Article</Link>
    </div>
    {error&&<div className="site-admin-alert error">{error}</div>}
    <div className="site-admin-card"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search articles…"/></div>
    <div className="site-admin-list">
      {filtered.map(post=><article className="site-admin-card" key={post.id}>
        <div><span className="site-admin-eyebrow">{post.status}</span><h2>{post.title||'Untitled'}</h2><p>{post.excerpt}</p><code>/{post.slug}</code></div>
        <div className="site-admin-actions">
          <Link className="site-admin-btn secondary" to={`/admin/blog/${post.id}`}>Edit</Link>
          {post.status==='published'&&<a className="site-admin-btn secondary" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">View <ExternalLink size={13}/></a>}
          <button className="site-admin-btn danger" type="button" onClick={()=>remove(post)}><Trash2 size={14}/> Delete</button>
        </div>
      </article>)}
      {!busy&&!filtered.length&&<div className="site-admin-card"><p>No articles yet.</p></div>}
    </div>
  </div>;
}
