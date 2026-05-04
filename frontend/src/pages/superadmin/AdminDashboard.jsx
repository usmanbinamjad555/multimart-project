import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Store, CheckCircle, Clock } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
      <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const load = () => adminAPI.getDashboard().then(r => setData(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    setActionLoading(id + status);
    await adminAPI.updateTenantStatus(id, { status });
    await load();
    setActionLoading('');
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  const { stats, recentTenants, categoryStats } = data;

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>Super Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>MultiMart platform overview</p>
      </div>
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon={Store} label="Total Stores" value={stats.totalTenants} color="#6366f1" bg="#ede9fe" />
        <StatCard icon={CheckCircle} label="Active" value={stats.activeTenants} color="#059669" bg="#d1fae5" />
        <StatCard icon={Clock} label="Pending" value={stats.pendingTenants} color="#d97706" bg="#fef3c7" />
        <StatCard icon={Users} label="Customers" value={stats.totalCustomers} color="#0284c7" bg="#dbeafe" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 18 }}>Stores by Category</div>
          {categoryStats.map(c => {
            const pct = stats.totalTenants ? Math.round((c.count / stats.totalTenants) * 100) : 0;
            return (
              <div key={c._id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{c._id}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.count}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius-lg)', padding: 24, color: 'white' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 18 }}>Platform Health</div>
          {[['Active Rate', `${Math.round((stats.activeTenants/Math.max(stats.totalTenants,1))*100)}%`, '#10b981'], ['Pending Review', stats.pendingTenants, '#f59e0b'], ['Total Users', stats.totalCustomers + stats.totalTenants + 1, '#6366f1']].map(([l,v,c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{l}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>Recent Store Applications</div>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead><tr><th>Store</th><th>Category</th><th>Owner</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {recentTenants.map(t => (
                <tr key={t._id}>
                  <td><div style={{ fontWeight: 700 }}>{t.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/{t.slug}</div></td>
                  <td><span className="badge badge-purple">{t.category}</span></td>
                  <td><div style={{ fontSize: 13 }}>{t.owner?.firstName} {t.owner?.lastName}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.owner?.email}</div></td>
                  <td><span className={`badge badge-${t.status==='active'?'success':t.status==='pending'?'warning':'error'}`}>{t.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {t.status === 'pending' && <>
                        <button onClick={() => handleStatus(t._id,'active')} className="btn btn-sm btn-primary" disabled={actionLoading===t._id+'active'}>Approve</button>
                        <button onClick={() => handleStatus(t._id,'rejected')} className="btn btn-sm btn-danger" style={{ background:'var(--error)',color:'white' }} disabled={actionLoading===t._id+'rejected'}>Reject</button>
                      </>}
                      {t.status === 'active' && <button onClick={() => handleStatus(t._id,'suspended')} className="btn btn-sm btn-outline" style={{ color:'var(--error)' }}>Suspend</button>}
                      {(t.status==='suspended'||t.status==='rejected') && <button onClick={() => handleStatus(t._id,'active')} className="btn btn-sm btn-outline">Restore</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
