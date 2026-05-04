import { Link } from 'react-router-dom';
import { ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Img from './Img';
import toast from 'react-hot-toast';

const fmt = (p) => `PKR ${Number(p || 0).toLocaleString('en-PK')}`;

export default function ProductCard({ product, tenantSlug, tenantName }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product._id,
      tenantSlug,
      tenantName,
      name: product.name,
      price: product.effectivePrice || product.price,
      image: product.images?.[0]?.url,
      stock: product.stock,
      isService: product.isService,
    });
    toast.success('Added to cart!');
  };

  const effectivePrice = product.effectivePrice || product.price;
  const discount = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;
  const outOfStock = !product.isService && product.stock === 0;

  return (
    <Link to={`/stores/${tenantSlug}/product/${product._id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* ── Image ── */}
        <div style={{ position: 'relative', paddingTop: '75%', background: 'var(--bg)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <Img
              src={product.images?.[0]?.url}
              alt={product.name}
              fallbackText={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            />
          </div>

          {/* Badges */}
          {discount > 0 && (
            <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--error)', color: 'white', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, zIndex: 1 }}>
              -{discount}%
            </span>
          )}
          {product.isService && (
            <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--accent)', color: 'white', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, zIndex: 1 }}>
              <Zap size={10} /> Service
            </span>
          )}
          {outOfStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <span style={{ background: 'var(--secondary)', color: 'white', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Out of Stock</span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '14px 16px' }}>
          {tenantName && (
            <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {tenantName}
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
            {product.name}
          </div>

          {product.stats?.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <span style={{ color: '#f59e0b', fontSize: 12 }}>{'★'.repeat(Math.round(product.stats.rating))}{'☆'.repeat(5 - Math.round(product.stats.rating))}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({product.stats.reviewCount})</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                {fmt(effectivePrice)}
              </div>
              {product.compareAtPrice > product.price && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {fmt(product.compareAtPrice)}
                </div>
              )}
            </div>
            {!outOfStock && (
              <button
                onClick={handleAddToCart}
                style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
              >
                <ShoppingCart size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
