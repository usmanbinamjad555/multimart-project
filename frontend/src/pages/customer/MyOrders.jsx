// MyOrders.jsx - customer's orders across all stores
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tenantAPI, orderAPI } from '../../services/api'
import { Package } from 'lucide-react'

export default function MyOrders() {
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const tenantsRes = await tenantAPI.getAll({ limit: 50 })
        const tenants = tenantsRes.data.data
        const orderPromises = tenants.map(t =>
          orderAPI.getMyOrders(t.slug).then(r =>
            r.data.data.map(o => ({ ...o, tenantName: t.name, tenantSlug: t.slug }))
          ).catch(() => [])
        )
        const results = await Promise.all(orderPromises)
        const flat = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setAllOrders(flat)
      } catch { }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const STATUS_COLOR = { pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'gray' }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 28 }}>My Orders</h1>
        {allOrders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No orders yet</h3>
            <p>You haven't placed any orders</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {allOrders.map(order => (
              <div key={order._id} style={mo.card}>
                <div style={mo.header}>
                  <div>
                    <div style={mo.orderNum}>{order.orderNumber}</div>
                    <div style={mo.store}>From: {order.tenantName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge badge-${STATUS_COLOR[order.status] || 'gray'}`}>{order.status}</span>
                    <div style={mo.date}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={mo.items}>
                  {order.items.map((item, i) => (
                    <div key={i} style={mo.item}>
                      <span>{item.productName} × {item.quantity}</span>
                      <span>PKR {item.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={mo.footer}>
                  <div style={mo.total}>Total: <strong>PKR {order.billing.total.toLocaleString()}</strong></div>
                  <Link to={`/store/${order.tenantSlug}/order/${order._id}`} className="btn btn-ghost btn-sm">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const mo = {
  card: { background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--gray-200)', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' },
  orderNum: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' },
  store: { color: 'var(--gray-500)', fontSize: '0.8rem', marginTop: 2 },
  date: { color: 'var(--gray-400)', fontSize: '0.78rem', marginTop: 6 },
  items: { padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 6 },
  item: { display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)' },
  total: { fontSize: '0.9rem', color: 'var(--gray-700)' },
}
