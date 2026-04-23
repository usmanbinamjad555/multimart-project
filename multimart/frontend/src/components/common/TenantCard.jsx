import { Link } from 'react-router-dom';
import { Star, Package, ArrowRight } from 'lucide-react';
import Img from './Img';

const COLORS = {
  Electronics: '#6366f1', Fashion: '#ec4899', 'Home & Garden': '#10b981',
  Sports: '#f59e0b', Books: '#3b82f6', 'Food & Grocery': '#ef4444',
  'Health & Beauty': '#a855f7', Services: '#14b8a6', Other: '#6b7280',
};

export default function TenantCard({ tenant }) {
  const c = COLORS[tenant.category] || '#6b7280';

  return (
    <Link to={`/stores/${tenant.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Banner strip */}
        <div style={{ height: 70, background: `linear-gradient(135deg, ${c}33, ${c}55)`, display: 'flex', justifyContent: 'flex-end', padding: '10px 14px' }}>
          <span style={{ background: `${c}22`, color: c, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, height: 'fit-content' }}>
            {tenant.category}
          </span>
        </div>

        <div style={{ padding: '0 18px 18px', marginTop: -26 }}>
          {/* Logo */}
          <div style={{ width: 52, height: 52, borderRadius: 12, background: c, border: '3px solid white', marginBottom: 12, overflow: 'hidden', flexShrink: 0 }}>
            <Img
              src={tenant.logo}
              alt={tenant.name}
              fallbackText={tenant.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>
            {tenant.name}
          </div>
          {tenant.description && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
              {tenant.description}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {tenant.stats?.rating > 0 && (
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={11} fill="#f59e0b" style={{ flexShrink: 0 }} />
                  {tenant.stats.rating}
                </span>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Package size={11} style={{ flexShrink: 0 }} />
                {tenant.stats?.totalProducts || 0} items
              </span>
            </div>
            <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              Visit <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
