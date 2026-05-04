import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { CheckCircle, Package } from 'lucide-react'

export default function Checkout() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getTenantCart, getTenantCartTotal, clearTenantCart, user } = useAuth()
  const cart = getTenantCart(slug)
  const items = Object.values(cart)
  const subtotal = getTenantCartTotal(slug)
  const shipping = subtotal > 2000 ? 0 : 200
  const total = subtotal + shipping

  const [form, setForm] = useState({
    street: '', city: '', state: '', country: 'Pakistan', zipCode: '',
    paymentMethod: 'cod', notes: '',
  })
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleOrder = async () => {
    if (!form.street || !form.city) return toast.error('Please fill in your address')
    try {
      setLoading(true)
      const orderItems = items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        variant: item.variant,
      }))
      const res = await orderAPI.place(slug, {
        items: orderItems,
        shippingAddress: { street: form.street, city: form.city, state: form.state, country: form.country, zipCode: form.zipCode },
        payment: { method: form.paymentMethod },
        notes: form.notes,
      })
      clearTenantCart(slug)
      toast.success('Order placed successfully!')
      navigate(`/store/${slug}/order/${res.data.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally { setLoading(false) }
  }

  if (items.length === 0) return (
    <div className="page"><div className="container"><p>Cart is empty. <Link to={`/store/${slug}`}>Go back to store</Link></p></div></div>
  )

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 28 }}>Checkout</h1>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Shipping */}
            <div style={ck.section}>
              <h3 style={ck.sTitle}>Shipping Address</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group"><label>Street Address *</label>
                  <input className="input" required value={form.street} onChange={set('street')} placeholder="House #, Street, Area" /></div>
                <div className="form-row">
                  <div className="form-group"><label>City *</label>
                    <input className="input" required value={form.city} onChange={set('city')} placeholder="Lahore" /></div>
                  <div className="form-group"><label>State / Province</label>
                    <input className="input" value={form.state} onChange={set('state')} placeholder="Punjab" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Country</label>
                    <input className="input" value={form.country} onChange={set('country')} /></div>
                  <div className="form-group"><label>ZIP Code</label>
                    <input className="input" value={form.zipCode} onChange={set('zipCode')} placeholder="54000" /></div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div style={ck.section}>
              <h3 style={ck.sTitle}>Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['cod', '💵 Cash on Delivery'], ['easypaisa', '📱 EasyPaisa'], ['jazzcash', '💳 JazzCash'], ['bank_transfer', '🏦 Bank Transfer']].map(([val, label]) => (
                  <label key={val} style={ck.radioLabel}>
                    <input type="radio" name="payment" value={val} checked={form.paymentMethod === val} onChange={set('paymentMethod')} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={ck.section}>
              <h3 style={ck.sTitle}>Order Notes (Optional)</h3>
              <textarea className="textarea" rows={3} value={form.notes} onChange={set('notes')} placeholder="Any special instructions..." style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <div style={ck.section}>
              <h3 style={ck.sTitle}>Order Summary</h3>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                  <img src={item.product.images?.[0]?.url || 'https://via.placeholder.com/48'} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, background: 'var(--gray-100)' }} />
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600, lineHeight: 1.3 }}>{item.product.name}</div>
                    <div style={{ color: 'var(--gray-500)' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-primary)', whiteSpace: 'nowrap' }}>PKR {(item.product.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--gray-200)', margin: '14px 0' }} />
              <div style={ck.row}><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
              <div style={ck.row}><span>Shipping</span><span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>{shipping === 0 ? 'FREE' : `PKR ${shipping}`}</span></div>
              <div style={{ height: 1, background: 'var(--gray-200)', margin: '10px 0' }} />
              <div style={{ ...ck.row, fontWeight: 700, fontSize: '1.05rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-display)' }}>PKR {total.toLocaleString()}</span>
              </div>
              <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }} onClick={handleOrder} disabled={loading}>
                {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : '🛒 Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ck = {
  section: { background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--gray-200)', padding: 24 },
  sTitle: { fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 18 },
  radioLabel: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 10 },
}
