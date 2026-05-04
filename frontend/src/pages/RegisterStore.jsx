import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Package, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const CATS = ['Electronics','Fashion','Home & Garden','Sports','Books','Food & Grocery','Health & Beauty','Automotive','Services','Other'];

export default function RegisterStore() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName:'',lastName:'',email:'',password:'',phone:'',storeName:'',storeDescription:'',storeCategory:'',storeEmail:'',storePhone:'',address:{city:'',country:'Pakistan'} });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(p => ({...p,[k]:v}));
  const setAddr = (k,v) => setForm(p => ({...p,address:{...p.address,[k]:v}}));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authAPI.registerTenant(form);
      toast.success('Store application submitted! Awaiting admin approval.');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:620, background:'white', borderRadius:'var(--radius-xl)', padding:'40px', boxShadow:'var(--shadow-lg)' }}>
        <Link to="/" style={{ display:'flex',alignItems:'center',gap:8,marginBottom:28 }}>
          <div style={{ width:36,height:36,background:'var(--primary)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center' }}><Package size={20} color="white" /></div>
          <span style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:800 }}>Multi<span style={{ color:'var(--primary)' }}>Mart</span></span>
        </Link>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:28 }}>
          {[1,2].map(n => (
            <div key={n} style={{ display:'flex',alignItems:'center',gap:6 }}>
              <div style={{ width:28,height:28,borderRadius:'50%',background:step>=n?'var(--primary)':'var(--border)',color:step>=n?'white':'var(--text-muted)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700 }}>{n}</div>
              {n<2 && <div style={{ width:40,height:2,background:step>n?'var(--primary)':'var(--border)' }} />}
            </div>
          ))}
          <span style={{ marginLeft:8,fontSize:13,color:'var(--text-muted)' }}>Step {step} of 2</span>
        </div>

        {step === 1 ? (
          <>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:24,fontWeight:800,marginBottom:6 }}>Your Account</h2>
            <p style={{ color:'var(--text-muted)',fontSize:14,marginBottom:24 }}>Create your seller account</p>
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div className="input-group"><label className="input-label">First Name *</label><input className="input" value={form.firstName} onChange={e=>set('firstName',e.target.value)} required /></div>
                <div className="input-group"><label className="input-label">Last Name *</label><input className="input" value={form.lastName} onChange={e=>set('lastName',e.target.value)} required /></div>
              </div>
              <div className="input-group"><label className="input-label">Email *</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div>
              <div className="input-group"><label className="input-label">Phone</label><input className="input" type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
              <div className="input-group"><label className="input-label">Password *</label><input className="input" type="password" minLength={6} value={form.password} onChange={e=>set('password',e.target.value)} required /></div>
            </div>
            <button onClick={() => { if(!form.firstName||!form.email||!form.password) return toast.error('Fill required fields'); setStep(2); }} className="btn btn-primary btn-full btn-lg" style={{ marginTop:20 }}>Continue →</button>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:24,fontWeight:800,marginBottom:6 }}>Your Store</h2>
            <p style={{ color:'var(--text-muted)',fontSize:14,marginBottom:24 }}>Tell us about your business</p>
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div className="input-group"><label className="input-label">Store Name *</label><input className="input" value={form.storeName} onChange={e=>set('storeName',e.target.value)} placeholder="e.g., Tech Galaxy" required /></div>
              <div className="input-group"><label className="input-label">Store Category *</label>
                <select className="select" value={form.storeCategory} onChange={e=>set('storeCategory',e.target.value)} required>
                  <option value="">Select category</option>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group"><label className="input-label">Store Description</label><textarea className="input" rows={3} value={form.storeDescription} onChange={e=>set('storeDescription',e.target.value)} placeholder="Describe your store..." style={{ resize:'vertical' }} /></div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div className="input-group"><label className="input-label">Business Email *</label><input className="input" type="email" value={form.storeEmail} onChange={e=>set('storeEmail',e.target.value)} required /></div>
                <div className="input-group"><label className="input-label">Business Phone</label><input className="input" value={form.storePhone} onChange={e=>set('storePhone',e.target.value)} /></div>
              </div>
              <div className="input-group"><label className="input-label">City</label><input className="input" value={form.address.city} onChange={e=>setAddr('city',e.target.value)} placeholder="Karachi" /></div>
            </div>
            <div style={{ display:'flex',gap:10,marginTop:20 }}>
              <button onClick={() => setStep(1)} className="btn btn-outline">← Back</button>
              <button onClick={handleSubmit} className="btn btn-primary btn-lg" style={{ flex:1 }} disabled={loading||!form.storeName||!form.storeCategory||!form.storeEmail}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
            <p style={{ fontSize:12,color:'var(--text-muted)',textAlign:'center',marginTop:12 }}>Your store will be reviewed and activated within 24 hours.</p>
          </>
        )}
        <div style={{ textAlign:'center',marginTop:16,fontSize:13,color:'var(--text-muted)' }}>Already have an account? <Link to="/login" style={{ color:'var(--primary)',fontWeight:600 }}>Sign in</Link></div>
      </div>
    </div>
  );
}
