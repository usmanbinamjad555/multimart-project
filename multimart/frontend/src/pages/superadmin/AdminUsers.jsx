import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Search, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const load = () => { setLoading(true); adminAPI.getUsers({ search, role: role || undefined, limit: 40 }).then(r => setUsers(r.data.data)).finally(() => setLoading(false)); };
  useEffect(load, [search, role]);

  const toggleUser = async (id) => { await adminAPI.toggleUser(id); toast.success('User updated'); load(); };

  return (
    <div className="animate-fade">
      <div className="section-header"><div className="section-title">All Users</div></div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, width: 240 }} />
        </div>
        {['', 'customer', 'tenant_admin', 'superadmin'].map(r => (
          <button key={r} onClick={() => setRole(r)} className={`btn btn-sm ${role === r ? 'btn-primary' : 'btn-outline'}`}>{r || 'All Roles'}</button>
        ))}
      </div>
      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>User</th><th>Role</th><th>Store</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.role==='superadmin'?'var(--accent)':u.role==='tenant_admin'?'var(--primary)':'#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>{u.firstName?.[0]}</div>
                      <div><div style={{ fontWeight: 600, fontSize: 14 }}>{u.firstName} {u.lastName}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div></div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${u.role==='superadmin'?'purple':u.role==='tenant_admin'?'orange':'info'}`}>{u.role}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.tenantId?.name || '—'}</td>
                  <td><span className={`badge badge-${u.isActive?'success':'error'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'superadmin' && (
                      <button onClick={() => toggleUser(u._id)} className="btn btn-sm btn-outline" style={{ color: u.isActive ? 'var(--error)' : 'var(--success)', fontSize: 12 }}>
                        {u.isActive ? <><UserX size={12} style={{ display:'inline', marginRight:4 }} />Deactivate</> : <><UserCheck size={12} style={{ display:'inline', marginRight:4 }} />Activate</>}
                      </button>
                    )}
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
