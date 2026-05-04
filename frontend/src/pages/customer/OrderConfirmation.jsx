// OrderConfirmation.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderAPI } from '../../services/api'
import { CheckCircle } from 'lucide-react'

export function OrderConfirmation() {
  const { slug, orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    orderAPI.getById(slug, orderId).then(r => setOrder(r.data.data))
  }, [slug, orderId])

  if (!order) return <div className="page-loader"><div className="spinner" /></div>

  const STATUS_COLOR = { pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'info', delivered: 'success', cancelled: 'danger' }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '40px 0 32px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--gray-200)', marginBottom: 24 }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Order Placed!</h1>
          <p style={{ color: 'var(--gray-500)', marginBottom: 16 }}>Thank you for your order. We'll notify you when it ships.</p>
          <div style={{ display: 'inline-block', background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '8px 20px', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em' }}>
            {order.orderNumber}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--gray-200)', padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Order Details</h3>
            <span className={`badge badge-${STATUS_COLOR[order.status] || 'gray'}`}>{order.status}</span>
          </div>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '0.875rem' }}>
              <span>{item.productName} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>PKR {item.totalPrice.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              PKR {order.billing.total.toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to={`/store/${slug}`} className="btn btn-ghost">Continue Shopping</Link>
          <Link to="/my-orders" className="btn btn-primary">View All Orders</Link>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
