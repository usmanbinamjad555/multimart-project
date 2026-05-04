import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tenantAPI, productAPI, searchAPI } from '../services/api';
import TenantCard from '../components/common/TenantCard';
import ProductCard from '../components/common/ProductCard';
import { ArrowRight, Zap, Shield, Truck, Star, Store, Search } from 'lucide-react';

const CATS = ['Electronics','Fashion','Home & Garden','Sports','Books','Food & Grocery','Health & Beauty','Services'];
const CAT_ICONS = { Electronics:'⚡', Fashion:'👗', 'Home & Garden':'🏠', Sports:'⚽', Books:'📚', 'Food & Grocery':'🛒', 'Health & Beauty':'💊', Services:'🔧' };

export default function Home() {
  const [tenants, setTenants] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      tenantAPI.getAll({ limit: 6 }),
    ]).then(([t]) => {
      setTenants(t.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* HERO */}
      <div style={{ background: 'var(--secondary)', padding: '72px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(255,77,0,0.15) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', right: -100, top: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,77,0,0.05)', border: '1px solid rgba(255,77,0,0.1)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,77,0,0.15)', border: '1px solid rgba(255,77,0,0.3)', padding: '6px 14px', borderRadius: 20, marginBottom: 20 }}>
              <Zap size={14} color="var(--primary)" />
              <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Pakistan's #1 Multi-Vendor Marketplace</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
              One Platform,<br /><span style={{ color: 'var(--primary)' }}>Thousands</span> of Stores
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 36, lineHeight: 1.6 }}>
              Discover products and services from verified sellers across Pakistan. Shop electronics, fashion, home goods, and more.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/stores" className="btn btn-primary btn-lg">Explore Stores <ArrowRight size={18} /></Link>
              <Link to="/register-store" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Open Your Store</Link>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
              {[['1000+','Products'],['50+','Stores'],['5000+','Happy Customers']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{v}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[[Truck,'Free Shipping','Orders above PKR 2,000'],[Shield,'Secure Payments','100% protected'],[Star,'Verified Sellers','All stores verified'],[Zap,'Fast Delivery','Same day in major cities']].map(([Icon,t,s]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(255,77,0,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '52px 24px' }}>

        {/* CATEGORIES */}
        <div style={{ marginBottom: 56 }}>
          <div className="section-header">
            <div><div className="section-title">Shop by Category</div><div className="section-subtitle">Find exactly what you're looking for</div></div>
            <Link to="/stores" style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>View All <ArrowRight size={15} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {CATS.map(cat => (
              <Link key={cat} to={`/stores?category=${cat}`}>
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '20px 16px', border: '1px solid var(--border)', textAlign: 'center', transition: 'var(--transition)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{CAT_ICONS[cat]}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* STORES */}
        <div style={{ marginBottom: 56 }}>
          <div className="section-header">
            <div><div className="section-title">Featured Stores</div><div className="section-subtitle">Top-rated sellers on MultiMart</div></div>
            <Link to="/stores" style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>All Stores <ArrowRight size={15} /></Link>
          </div>
          {loading ? (
            <div className="grid-3">
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 220 }} />)}
            </div>
          ) : (
            <div className="grid-3">
              {tenants.map(t => <TenantCard key={t._id} tenant={t} />)}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius-xl)', padding: '48px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>Start Selling on MultiMart</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>Reach thousands of customers across Pakistan. Set up your store in minutes.</div>
          </div>
          <Link to="/register-store" className="btn btn-primary btn-lg">Open Your Store <ArrowRight size={18} /></Link>
        </div>
      </div>
    </div>
  );
}
