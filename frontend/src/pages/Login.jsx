import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.firstName}!`);
      if (user.role === 'superadmin') navigate('/admin');
      else if (user.role === 'tenant_admin') navigate('/tenant/dashboard');
      else navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const quickLogin = (email, password) => setForm({ email, password });

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel */}
      <div style={{ flex: '0 0 480px', background: 'var(--secondary)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={22} color="white" /></div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'white' }}>Multi<span style={{ color: 'var(--primary)' }}>Mart</span></span>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>Welcome<br />Back</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, marginBottom: 40 }}>Sign in to your MultiMart account to continue shopping or manage your store.</p>
        
        {/* Quick Login Buttons */}
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Quick Login (Demo)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['Super Admin','admin@multimart.com','Admin@12345'],['Store Admin','ali@techzone.pk','password123'],['Customer','ahmed@example.com','password123']].map(([r,e,p]) => (
              <button key={r} onClick={() => quickLogin(e,p)} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', fontSize: 13, textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{r}</span> — {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 }}>Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link></p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><div className="spinner spinner-sm" />Signing In...</> : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Want to sell? <Link to="/register-store" style={{ color: 'var(--primary)', fontWeight: 600 }}>Open a store</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
