import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    adminAPI.getTenants({ search, status: filter || undefined, limit: 30 }).then(r => { setTenants(r.data.data); setTotal(r.data.total); }).finally(() => setLoading(false));
  };
  useEffect(load, [search, filter]);

  const changeStatus = async (id, status) => { await adminAPI.updateTenantStatus(id, { status }); toast.success(`Store ${status}`); load(); };
  const deleteTenant = async (id) => { if (!confirm('Delete this store?')) return; await adminAPI.deleteTenant(id); toast.success('Deleted'); load(); };

  return (
    <div className="animate-fade">
      <div className="section-header"><div><div className="section-title">All Stores</div><div className="section-subtitle">{total} stores total</div></div></div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search stores..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, width: 240 }} />
        </div>
        {['', 'active', 'pending', 'suspended', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}>{s || 'All'}</button>
        ))}
      </div>
      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Store</th><th>Category</th><th>Owner</th><th>Status</th><th>Products</th><th>Revenue</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {t.logo ? <img src={t.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ color: 'white', fontWeight: 700 }}>{t.name[0]}</span>}
                      </div>
                      <div><div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/{t.slug}</div></div>
                    </div>
                  </td>
                  <td><span className="badge badge-purple">{t.category}</span></td>
                  <td><div style={{ fontSize: 13 }}>{t.owner?.firstName} {t.owner?.lastName}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.owner?.email}</div></td>
                  <td><span className={`badge badge-${t.status==='active'?'success':t.status==='pending'?'warning':'error'}`}>{t.status}</span></td>
                  <td style={{ textAlign: 'center' }}>{t.stats?.totalProducts || 0}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>PKR {(t.stats?.totalRevenue || 0).toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {t.status === 'pending' && <button onClick={() => changeStatus(t._id,'active')} className="btn btn-sm btn-primary">Approve</button>}
                      {t.status === 'active' && <button onClick={() => changeStatus(t._id,'suspended')} className="btn btn-sm btn-outline" style={{ color:'var(--warning)', fontSize: 12 }}>Suspend</button>}
                      {(t.status==='suspended'||t.status==='rejected') && <button onClick={() => changeStatus(t._id,'active')} className="btn btn-sm btn-outline" style={{ fontSize: 12 }}>Restore</button>}
                      <button onClick={() => deleteTenant(t._id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
