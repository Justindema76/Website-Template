import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../../auth/AdminAuthContext';
import { SOCIAL_NETWORKS, emptySocialLinks } from '../../config/siteContent';
import { loadAdminSocial, saveAdminSocial } from '../../services/siteAdminService';

export default function SocialAdmin(){
  const {accessToken}=useAuth();
  const [social,setSocial]=useState(emptySocialLinks());
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{
    if(!accessToken)return;
    setBusy(true);setError('');
    loadAdminSocial(accessToken).then(setSocial).catch(err=>setError(err.message)).finally(()=>setBusy(false));
  },[accessToken]);

  const update=(key,patch)=>setSocial(current=>({...current,[key]:{...current[key],...patch}}));
  const save=async()=>{
    setBusy(true);setError('');setMessage('');
    try{setSocial(await saveAdminSocial(accessToken,social));setMessage('Social links saved.');}
    catch(err){setError(err.message||'Unable to save social links.');}
    finally{setBusy(false);}
  };

  return <div>
    <div className="site-admin-page-head">
      <div><p className="site-admin-eyebrow">Website</p><h1>Social Links</h1><p>Add the business social profiles once and reuse them across the site.</p></div>
      <button className="site-admin-btn" type="button" onClick={save} disabled={busy}><Save size={14}/> {busy?'Saving…':'Save Social Links'}</button>
    </div>
    {error&&<div className="site-admin-alert error">{error}</div>}
    {message&&<div className="site-admin-alert success">{message}</div>}
    <div className="site-admin-card site-admin-social-form">
      {SOCIAL_NETWORKS.map(network=><div className="site-admin-social-row" key={network.key}>
        <div className="site-admin-social-name"><span className="site-admin-social-fallback">{network.label[0]}</span><strong>{network.label}</strong></div>
        <input value={social[network.key]?.url||''} onChange={e=>update(network.key,{url:e.target.value})} placeholder={`https://${network.key}.com/...`}/>
        <label className="site-admin-switch"><input type="checkbox" checked={social[network.key]?.enabled!==false} onChange={e=>update(network.key,{enabled:e.target.checked})}/><span>Show</span></label>
      </div>)}
    </div>
  </div>;
}
