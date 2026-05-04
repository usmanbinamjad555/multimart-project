// Cart.jsx
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react'

export function Cart() {
  const { slug } = useParams()
  const { getTenantCart, removeFromCart, updateCartQuantity, getTenantCartTotal, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const cart = getTenantCart(slug)
  const items = Object.entries(cart)
  const subtotal = getTenantCartTotal(slug)
  const shipping = subtotal > 2000 ? 0 : 200
  const total = subtotal + shipping

  if (items.length === 0) return (
    <div className="page">
      <div className="container">
        <div className="empty-state" style={{ padding: 80 }}>
          <ShoppingCart size={64} style={{ margin: '0 auto 16px', color: 'var(--gray-300)' }} />
          <h3>Your cart is empty</h3>
          <p style={{ marginBottom: 24 }}>Add products from the store to get started</p>
          <Link to={`/store/${slug}`} className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <Link to={`/store/${slug}`} style={cs.back}><ArrowLeft size={16} /> Continue Shopping</Link>
        <h1 style={cs.title}>Shopping Cart <span style={{ color: 'var(--gray-400)', fontSize: '1rem', fontWeight: 400 }}>({items.length} items)</span></h1>

        <div style={cs.layout}>
          <div style={{ flex: 1 }}>
            {items.map(([key, item]) => (
              <div key={key} style={cs.cartItem}>
                <img src={item.product.images?.[0]?.url || `https://via.placeholder.com/80?text=${item.product.name}`}
                  alt={item.product.name} style={cs.itemImg} />
                <div style={cs.itemInfo}>
                  <div style={cs.itemName}>{item.product.name}</div>
                  {item.variant && <div style={cs.itemVariant}>{item.variant.name}: {item.variant.option}</div>}
                  <div style={cs.itemPrice}>PKR {item.product.price.toLocaleString()}</div>
                </div>
                <div style={cs.qtyControl}>
                  <button onClick={() => updateCartQuantity(slug, key, item.quantity - 1)} style={cs.qtyBtn}><Minus size={14} /></button>
                  <span style={cs.qtyNum}>{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(slug, key, item.quantity + 1)} style={cs.qtyBtn}><Plus size={14} /></button>
                </div>
                <div style={cs.itemTotal}>PKR {(item.product.price * item.quantity).toLocaleString()}</div>
                <button onClick={() => removeFromCart(slug, key)} style={cs.removeBtn}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div style={cs.summary}>
            <h3 style={cs.summaryTitle}>Order Summary</h3>
            <div style={cs.summaryRow}><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
            <div style={cs.summaryRow}><span>Shipping</span><span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>{shipping === 0 ? 'FREE' : `PKR ${shipping}`}</span></div>
            {shipping > 0 && <p style={cs.freeShipNote}>Add PKR {(2000 - subtotal).toLocaleString()} more for free shipping</p>}
            <div style={{ height: 1, background: 'var(--gray-200)', margin: '16px 0' }} />
            <div style={{ ...cs.summaryRow, fontWeight: 700, fontSize: '1.1rem' }}><span>Total</span><span style={{ color: 'var(--brand-primary)' }}>PKR {total.toLocaleString()}</span></div>
            {isAuthenticated ? (
              <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }}
                onClick={() => navigate(`/store/${slug}/checkout`)}>
                Proceed to Checkout
              </button>
            ) : (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', textAlign: 'center', marginBottom: 12 }}>Sign in to checkout</p>
                <Link to="/login" className="btn btn-primary btn-full btn-lg">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

const cs = {
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: 20 },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 28 },
  layout: { display: 'flex', gap: 28, alignItems: 'flex-start' },
  cartItem: { display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--gray-200)', padding: '16px', marginBottom: 12 },
  itemImg: { width: 80, height: 80, objectFit: 'cover', borderRadius: 8, background: 'var(--gray-100)', flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 },
  itemVariant: { fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 6 },
  itemPrice: { color: 'var(--gray-600)', fontSize: '0.875rem' },
  qtyControl: { display: 'flex', alignItems: 'center', border: '1.5px solid var(--gray-200)', borderRadius: 8 },
  qtyBtn: { width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-600)' },
  qtyNum: { width: 36, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' },
  itemTotal: { fontFamily: 'var(--font-display)', fontWeight: 700, minWidth: 120, textAlign: 'right', color: 'var(--brand-primary)' },
  removeBtn: { color: 'var(--gray-400)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' },
  summary: { width: 300, flexShrink: 0, background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--gray-200)', padding: 24, position: 'sticky', top: 80 },
  summaryTitle: { fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 12 },
  freeShipNote: { fontSize: '0.78rem', color: 'var(--success)', background: '#d1fae5', padding: '6px 10px', borderRadius: 8 },
}
