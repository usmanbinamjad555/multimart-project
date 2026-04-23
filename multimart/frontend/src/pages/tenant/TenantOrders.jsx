import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';
import { Search, Eye, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const fmt = (p) => `PKR ${Number(p||0).toLocaleString()}`;
const STATUS_COLORS = { pending:'warning',confirmed:'info',processing:'purple',shipped:'orange',out_for_delivery:'orange',delivered:'success',cancelled:'error',refunded:'error',returned:'error' };
const NEXT_STATUSES = { pending:['confirmed','cancelled'],confirmed:['processing','cancelled'],processing:['shipped'],shipped:['out_for_delivery'],out_for_delivery:['delivered','returned'] };

export default function TenantOrders() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantId?.slug;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState('');

  const load = () => {
    setLoading(true);
    orderAPI.getAll(tenantSlug, { search, status: statusFilter||undefined, limit: 30 })
      .then(r => { setOrders(r.data.data); setTotal(r.data.total); }).finally(() => setLoading(false));
  };
  useEffect(() => { if(tenantSlug) load(); }, [tenantSlug, search, statusFilter]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await orderAPI.updateStatus(tenantSlug, orderId, { status });
      toast.success(`Order ${status}`);
      load();
      if (selected?._id === orderId) {
        const r = await orderAPI.getOne(tenantSlug, orderId);
        setSelected(r.data.data);
      }
    } finally { setUpdating(''); }
  };

  const statuses = ['','pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'];

  return (
    <div className="animate-fade" style={{ display:'flex',gap:20,height:'100%' }}>
      <div style={{ flex:1,minWidth:0 }}>
        <div className="section-header">
          <div><div className="section-title">Orders</div><div className="section-subtitle">{total} total</div></div>
        </div>
        <div style={{ display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <Search size={15} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)' }} />
            <input className="input" placeholder="Search orders..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:34,width:240 }} />
          </div>
          <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
            {statuses.map(s => <button key={s} onClick={() => setStatusFilter(s)} className={`btn btn-sm ${statusFilter===s?'btn-primary':'btn-outline'}`}>{s||'All'}</button>)}
          </div>
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} style={{ cursor:'pointer' }}>
                    <td><div style={{ fontWeight:700,fontSize:13 }}>{o.orderNumber}</div></td>
                    <td><div style={{ fontSize:13 }}>{o.customerName}</div><div style={{ fontSize:11,color:'var(--text-muted)' }}>{o.customerEmail}</div></td>
                    <td style={{ textAlign:'center' }}>{o.items?.length}</td>
                    <td style={{ fontWeight:700,fontSize:13 }}>{fmt(o.billing?.total)}</td>
                    <td><span className="badge badge-info">{o.payment?.method?.toUpperCase()}</span></td>
                    <td><span className={`badge badge-${STATUS_COLORS[o.status]||'gray'}`}>{o.status}</span></td>
                    <td style={{ fontSize:12,color:'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => setSelected(o)} className="btn btn-sm btn-outline"><Eye size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Panel */}
      {selected && (
        <div style={{ width:360,flexShrink:0,background:'white',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:24,height:'fit-content',position:'sticky',top:32 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
            <div style={{ fontFamily:'var(--font-display)',fontSize:16,fontWeight:800 }}>Order Details</div>
            <button onClick={() => setSelected(null)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:20,color:'var(--text-muted)' }}>×</button>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,color:'var(--text-muted)',marginBottom:4 }}>Order Number</div>
            <div style={{ fontWeight:700 }}>{selected.orderNumber}</div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,color:'var(--text-muted)',marginBottom:4 }}>Customer</div>
            <div style={{ fontWeight:600 }}>{selected.customerName}</div>
            <div style={{ fontSize:13,color:'var(--text-secondary)' }}>{selected.customerEmail}</div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,color:'var(--text-muted)',marginBottom:4 }}>Ship To</div>
            <div style={{ fontSize:13 }}>{selected.shippingAddress?.street}, {selected.shippingAddress?.city}</div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,color:'var(--text-muted)',marginBottom:6 }}>Items</div>
            {selected.items?.map((it,i) => (
              <div key={i} style={{ display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6 }}>
                <span>{it.productName} ×{it.quantity}</span>
                <span style={{ fontWeight:600 }}>{fmt(it.totalPrice)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--border)',paddingTop:12,marginBottom:16 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4 }}><span style={{ color:'var(--text-muted)' }}>Subtotal</span><span>{fmt(selected.billing?.subtotal)}</span></div>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4 }}><span style={{ color:'var(--text-muted)' }}>Shipping</span><span>{fmt(selected.billing?.shippingCost)}</span></div>
            <div style={{ display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:15 }}><span>Total</span><span style={{ color:'var(--primary)' }}>{fmt(selected.billing?.total)}</span></div>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12,color:'var(--text-muted)',marginBottom:8 }}>Current Status</div>
            <span className={`badge badge-${STATUS_COLORS[selected.status]||'gray'}`} style={{ fontSize:13 }}>{selected.status}</span>
          </div>
          {NEXT_STATUSES[selected.status]?.length > 0 && (
            <div>
              <div style={{ fontSize:12,color:'var(--text-muted)',marginBottom:8 }}>Update Status</div>
              <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                {NEXT_STATUSES[selected.status].map(s => (
                  <button key={s} onClick={() => updateStatus(selected._id,s)} className="btn btn-sm btn-primary" disabled={updating===selected._id} style={{ textTransform:'capitalize' }}>
                    {s.replace(/_/g,' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
