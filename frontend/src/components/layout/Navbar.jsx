import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, LogOut, ChevronDown, LayoutDashboard, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => { e.preventDefault(); if (search.trim()) { navigate(`/search?q=${encodeURIComponent(search.trim())}`); setSearch(''); } };
  const handleLogout = () => { logout(); navigate('/'); };
  const getDashboardPath = () => user?.role === 'superadmin' ? '/admin' : user?.role === 'tenant_admin' ? '/tenant/dashboard' : '/account';
  const isActive = (p) => location.pathname === p;

  return (
    <nav style={{ background: 'var(--secondary)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 70, gap: 16 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'white' }}>
            Multi<span style={{ color: 'var(--primary)' }}>Mart</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 4 }}>
          {[['/', 'Home'], ['/stores', 'Stores'], ['/search', 'Explore']].map(([p, l]) => (
            <Link key={p} to={p} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500, color: isActive(p) ? 'var(--primary)' : 'rgba(255,255,255,0.7)' }}>{l}</Link>
          ))}
        </div>

        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', maxWidth: 440 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products across all stores..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ marginLeft: 8, borderRadius: 8 }}>Search</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'white' }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
          </Link>

          {isLoggedIn ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{user?.firstName?.[0]?.toUpperCase()}</div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{user?.firstName}</span>
                <ChevronDown size={14} />
              </button>
              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', borderRadius: 12, boxShadow: 'var(--shadow-lg)', minWidth: 200, overflow: 'hidden', border: '1px solid var(--border)', zIndex: 200, animation: 'fadeIn 0.15s ease' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.firstName} {user?.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <Link to={getDashboardPath()} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 14 }}><LayoutDashboard size={16} /> Dashboard</Link>
                    {user?.role === 'customer' && <Link to="/orders" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--text-primary)', fontSize: 14 }}><Package size={16} /> My Orders</Link>}
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--error)', fontSize: 14, width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}><LogOut size={16} /> Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
