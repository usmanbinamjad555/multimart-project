import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ firstName:'',lastName:'',email:'',password:'',phone:'' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:460, background:'white', borderRadius:'var(--radius-xl)', padding:40, boxShadow:'var(--shadow-lg)' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28 }}>
          <div style={{ width:36,height:36,background:'var(--primary)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center' }}><Package size={20} color="white" /></div>
          <span style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:800 }}>Multi<span style={{ color:'var(--primary)' }}>Mart</span></span>
        </Link>
        <h2 style={{ fontFamily:'var(--font-display)',fontSize:26,fontWeight:800,marginBottom:6 }}>Create Account</h2>
        <p style={{ color:'var(--text-muted)',fontSize:14,marginBottom:28 }}>Already have an account? <Link to="/login" style={{ color:'var(--primary)',fontWeight:600 }}>Sign in</Link></p>
        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div className="input-group"><label className="input-label">First Name</label><input className="input" value={form.firstName} onChange={e=>set('firstName',e.target.value)} required /></div>
            <div className="input-group"><label className="input-label">Last Name</label><input className="input" value={form.lastName} onChange={e=>set('lastName',e.target.value)} required /></div>
          </div>
          <div className="input-group"><label className="input-label">Email</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div>
          <div className="input-group"><label className="input-label">Phone (optional)</label><input className="input" type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
          <div className="input-group"><label className="input-label">Password</label><input className="input" type="password" minLength={6} value={form.password} onChange={e=>set('password',e.target.value)} required /></div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop:8 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div style={{ textAlign:'center',marginTop:20,fontSize:13,color:'var(--text-muted)' }}>
          Want to sell? <Link to="/register-store" style={{ color:'var(--primary)',fontWeight:600 }}>Open a Store</Link>
        </div>
      </div>
    </div>
  );
}
