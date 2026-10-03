import { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../auth/AdminAuthContext';
import { loadAdminSetting, saveAdminSetting } from '../../services/siteAdminService';
import './settings.css';

const emptyProfile={
  businessName:'Business Name',
  domain:'example.com',
  contactEmail:'',
  contactPhone:'',
  address:'',
  defaultSeoTitle:'Business Name',
  defaultSeoDescription:'Add your website description.',
};

export default function SettingsAdmin(){
  const {accessToken}=useAuth();
  const [form,setForm]=useState(emptyProfile);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{
    if(!accessToken)return;
    setBusy(true);setError('');
    loadAdminSetting(accessToken,'site_profile')
      .then(value=>setForm({...emptyProfile,...(value||{})}))
      .catch(err=>setError(err.message||'Unable to load settings.'))
      .finally(()=>setBusy(false));
  },[accessToken]);

  const update=(key,value)=>setForm(current=>({...current,[key]:value}));
  const save=async event=>{
    event.preventDefault();setBusy(true);setError('');setMessage('');
    try{setForm({...emptyProfile,...await saveAdminSetting(accessToken,'site_profile',form)});setMessage('Website settings saved.');}
    catch(err){setError(err.message||'Unable to save settings.');}
    finally{setBusy(false);}
  };

  return <div>
    <div className="site-admin-page-head">
      <div><p className="site-admin-eyebrow">Configuration</p><h1>Settings</h1><p>Keep the basic client website information in one place.</p></div>
      <span className="settings-page-icon" aria-hidden="true"><SettingsIcon size={22}/></span>
    </div>
    {error&&<div className="site-admin-alert error">{error}</div>}
    {message&&<div className="site-admin-alert success">{message}</div>}
    <form className="site-admin-card site-admin-form-grid" onSubmit={save}>
      <label>Business name<input value={form.businessName} onChange={e=>update('businessName',e.target.value)}/></label>
      <label>Domain<input value={form.domain} onChange={e=>update('domain',e.target.value)}/></label>
      <label>Email<input type="email" value={form.contactEmail} onChange={e=>update('contactEmail',e.target.value)}/></label>
      <label>Phone<input value={form.contactPhone} onChange={e=>update('contactPhone',e.target.value)}/></label>
      <label className="full">Address<input value={form.address} onChange={e=>update('address',e.target.value)}/></label>
      <label className="full">Default SEO title<input value={form.defaultSeoTitle} onChange={e=>update('defaultSeoTitle',e.target.value)}/></label>
      <label className="full">Default SEO description<textarea rows={3} value={form.defaultSeoDescription} onChange={e=>update('defaultSeoDescription',e.target.value)}/></label>
      <div className="full site-admin-note">Deployment secrets, Supabase keys and the authorized admin email stay in Vercel environment variables. They are not stored here.</div>
      <div className="full"><button className="site-admin-btn" type="submit" disabled={busy}><Save size={14}/> {busy?'Saving…':'Save Settings'}</button></div>
    </form>
  </div>;
}
