import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const fmt = (p) => `PKR ${p?.toLocaleString('en-PK') || 0}`;

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <ShoppingBag size={72} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 12 }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Discover products from our amazing stores</p>
      <Link to="/stores" className="btn btn-primary btn-lg">Explore Stores <ArrowRight size={18} /></Link>
    </div>
  );

  const shipping = cartTotal > 2000 ? 0 : 200;
  const total = cartTotal + shipping;

  // Group items by tenant
  const byTenant = cartItems.reduce((acc, item) => {
    const key = item.tenantSlug;
    if (!acc[key]) acc[key] = { name: item.tenantName, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 28 }}>
        Shopping Cart <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>({cartCount} items)</span>
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(byTenant).map(([slug, group]) => (
            <div key={slug} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>From: <Link to={`/stores/${slug}`} style={{ color: 'var(--primary)' }}>{group.name || slug}</Link></div>
              </div>
              {group.items.map(item => (
                <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)' }}>No img</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{fmt(item.price)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQuantity(item.productId, item.tenantSlug, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1.5px solid var(--border)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={12} /></button>
                    <span style={{ fontSize: 15, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.tenantSlug, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1.5px solid var(--border)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={12} /></button>
                  </div>
                  <div style={{ minWidth: 80, textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{fmt(item.price * item.quantity)}</div>
                  <button onClick={() => removeFromCart(item.productId, item.tenantSlug)} style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 24, position: 'sticky', top: 90 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Order Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span style={{ fontWeight: 600 }}>{fmt(cartTotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--success)' : 'inherit' }}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
            </div>
            {shipping === 0 && <div style={{ fontSize: 12, color: 'var(--success)', background: '#d1fae5', padding: '6px 10px', borderRadius: 6 }}>🎉 You qualify for free shipping!</div>}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>
              <span>Total</span><span style={{ color: 'var(--primary)' }}>{fmt(total)}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }}>
            Proceed to Checkout <ArrowRight size={18} />
          </button>
          <Link to="/stores" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 14, color: 'var(--text-muted)' }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
