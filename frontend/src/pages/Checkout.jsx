import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, ShoppingBag, Truck } from 'lucide-react';

const fmt = (p) => `PKR ${p?.toLocaleString('en-PK') || 0}`;

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ street: '', city: '', state: '', country: 'Pakistan', zipCode: '', phone: user?.phone || '', paymentMethod: 'cod', notes: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const shipping = cartTotal > 2000 ? 0 : 200;

  const handleOrder = async () => {
    if (!form.street || !form.city) return toast.error('Please fill shipping address');
    setLoading(true);
    try {
      const byTenant = cartItems.reduce((acc, item) => {
        if (!acc[item.tenantSlug]) acc[item.tenantSlug] = [];
        acc[item.tenantSlug].push(item);
        return acc;
      }, {});
      for (const [slug, items] of Object.entries(byTenant)) {
        await orderAPI.place(slug, {
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: { street: form.street, city: form.city, state: form.state, country: form.country, zipCode: form.zipCode },
          payment: { method: form.paymentMethod },
          notes: form.notes,
        });
      }
      clearCart();
      setSuccess(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Order failed'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 500 }}>
      <div style={{ width: 80, height: 80, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <CheckCircle size={40} color="var(--success)" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Order Placed!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Your order has been received and is being processed. You'll receive updates soon.</p>
      <button onClick={() => navigate('/stores')} className="btn btn-primary btn-lg">Continue Shopping</button>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 28 }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Truck size={20} /> Shipping Address</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group"><label className="input-label">Street Address *</label><input className="input" value={form.street} onChange={e => set('street', e.target.value)} placeholder="House #, Street name" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group"><label className="input-label">City *</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Karachi" /></div>
                <div className="input-group"><label className="input-label">State/Province</label><input className="input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Sindh" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group"><label className="input-label">Country</label><input className="input" value={form.country} onChange={e => set('country', e.target.value)} /></div>
                <div className="input-group"><label className="input-label">ZIP Code</label><input className="input" value={form.zipCode} onChange={e => set('zipCode', e.target.value)} /></div>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['cod','💵 Cash on Delivery'],['easypaisa','📱 EasyPaisa'],['jazzcash','📱 JazzCash'],['card','💳 Credit/Debit Card']].map(([v, l]) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: `2px solid ${form.paymentMethod === v ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', transition: 'var(--transition)' }}>
                  <input type="radio" name="payment" value={v} checked={form.paymentMethod === v} onChange={() => set('paymentMethod', v)} style={{ accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: 14, fontWeight: form.paymentMethod === v ? 600 : 400 }}>{l}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Order Notes (Optional)</h3>
            <textarea className="input" rows={3} placeholder="Any special instructions?" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 24, position: 'sticky', top: 90 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Your Order</div>
          <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
            {cartItems.map(item => (
              <div key={item.productId} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg)', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span>{fmt(cartTotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'var(--text-secondary)' }}>Shipping</span><span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
              <span>Total</span><span style={{ color: 'var(--primary)' }}>{fmt(cartTotal + shipping)}</span>
            </div>
          </div>
          <button onClick={handleOrder} className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
