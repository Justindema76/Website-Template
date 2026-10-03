import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Mail, Phone, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useAuth } from '../../auth/AdminAuthContext';
import { deleteAdminServiceRequest, loadAdminServiceRequests, updateAdminServiceRequest } from '../../services/siteAdminService';

const statuses=['new','reviewing','contacted','proposal_sent','accepted','in_progress','complete','declined','spam'];
const statusLabel=value=>String(value||'new').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const formatDate=value=>{if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString();};

export default function ServiceRequestsAdmin(){
  const {accessToken}=useAuth();
  const [requests,setRequests]=useState([]);
  const [selected,setSelected]=useState(null);
  const [q,setQ]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  const refresh=async()=>{
    setBusy(true);setError('');
    try{
      const rows=await loadAdminServiceRequests(accessToken);
      setRequests(rows);
      if(selected){
        const next=rows.find(row=>row.id===selected.id);
        setSelected(next||null);
      }
    }catch(err){setError(err.message||'Unable to load requests.');}
    finally{setBusy(false);}
  };
  useEffect(()=>{if(accessToken)refresh();},[accessToken]);

  const filtered=useMemo(()=>{
    const term=q.trim().toLowerCase();
    return !term?requests:requests.filter(row=>`${row.name} ${row.email} ${row.company} ${row.requested_service} ${row.message}`.toLowerCase().includes(term));
  },[requests,q]);

  const updateStatus=async(row,status)=>{
    setBusy(true);setError('');
    try{await updateAdminServiceRequest(accessToken,row.id,{status});await refresh();}
    catch(err){setError(err.message||'Unable to update request.');}
    finally{setBusy(false);}
  };

  const remove=async row=>{
    if(!window.confirm(`Delete the request from ${row.name||row.email}?`))return;
    setBusy(true);setError('');
    try{await deleteAdminServiceRequest(accessToken,row.id);setSelected(null);await refresh();}
    catch(err){setError(err.message||'Unable to delete request.');}
    finally{setBusy(false);}
  };

  return <div>
    <div className="site-admin-page-head">
      <div><p className="site-admin-eyebrow">Requests</p><h1>Service Requests</h1><p>Review quote and project enquiries from the website.</p></div>
      <button className="site-admin-btn secondary" type="button" onClick={refresh} disabled={busy}><RefreshCw size={14}/> Refresh</button>
    </div>
    {error&&<div className="site-admin-alert error">{error}</div>}
    <div className="site-admin-card"><div style={{display:'flex',alignItems:'center',gap:8}}><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search requests…" style={{flex:1}}/></div></div>
    <div className="site-admin-list">
      {filtered.map(row=><article className="site-admin-card" key={row.id}>
        <div><span className="site-admin-eyebrow">{statusLabel(row.status)}</span><h2>{row.name||'Website enquiry'}</h2><p>{row.company||row.email}</p><small>{formatDate(row.created_at)}</small></div>
        <div className="site-admin-actions">
          <select value={row.status||'new'} onChange={e=>updateStatus(row,e.target.value)}>{statuses.map(status=><option key={status} value={status}>{statusLabel(status)}</option>)}</select>
          <button className="site-admin-btn secondary" type="button" onClick={()=>setSelected(row)}>Open</button>
        </div>
      </article>)}
      {!busy&&!filtered.length&&<div className="site-admin-card"><p>No service requests yet.</p></div>}
    </div>

    {selected&&<div className="site-admin-modal-backdrop" onClick={()=>setSelected(null)}>
      <section className="site-admin-modal" onClick={e=>e.stopPropagation()}>
        <div className="site-admin-page-head"><div><p className="site-admin-eyebrow">{statusLabel(selected.status)}</p><h2>{selected.name}</h2></div><button className="site-admin-btn secondary small" type="button" onClick={()=>setSelected(null)}><X size={14}/></button></div>
        <div className="site-admin-detail-grid">
          <div><strong>Email</strong><p>{selected.email||'—'}</p></div>
          <div><strong>Phone</strong><p>{selected.phone||'—'}</p></div>
          <div><strong>Company</strong><p>{selected.company||'—'}</p></div>
          <div><strong>Service</strong><p>{selected.requested_service||'—'}</p></div>
          <div><strong>Budget</strong><p>{selected.budget_range||'—'}</p></div>
          <div><strong>Timeline</strong><p>{selected.timeline||'—'}</p></div>
        </div>
        {selected.website&&<p><a href={selected.website} target="_blank" rel="noreferrer">Open website <ExternalLink size={12}/></a></p>}
        <div className="site-admin-card"><strong>Request details</strong><p style={{whiteSpace:'pre-wrap'}}>{selected.message}</p></div>
        <div className="site-admin-actions">
          {selected.email&&<a className="site-admin-btn" href={`mailto:${selected.email}`}><Mail size={14}/> Email</a>}
          {selected.phone&&<a className="site-admin-btn secondary" href={`tel:${selected.phone}`}><Phone size={14}/> Call</a>}
          <button className="site-admin-btn danger" type="button" onClick={()=>remove(selected)}><Trash2 size={14}/> Delete</button>
        </div>
      </section>
    </div>}
  </div>;
}
