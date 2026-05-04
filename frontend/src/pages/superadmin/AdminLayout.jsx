import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminTenants from './AdminTenants';
import AdminUsers from './AdminUsers';
import { LayoutDashboard, Store, Users, LogOut, Package } from 'lucide-react';

export default function AdminLayout() {
  const [active, setActive] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const pages = { dashboard: <AdminDashboard />, tenants: <AdminTenants />, users: <AdminUsers /> };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ width:30,height:30,background:'var(--primary)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center' }}><Package size={16} color="white" /></div>
            <span style={{ color:'white' }}>Multi<span style={{ color:'var(--primary)' }}>Mart</span> Admin</span>
          </div>
        </div>
        <div>
          <div className="sidebar-section-title">Management</div>
          {[['dashboard',LayoutDashboard,'Dashboard'],['tenants',Store,'Stores'],['users',Users,'Users']].map(([key,Icon,label]) => (
            <button key={key} onClick={() => setActive(key)} className={`sidebar-link ${active===key?'active':''}`}><Icon size={17} />{label}</button>
          ))}
        </div>
        <div style={{ marginTop:'auto',padding:'16px 0',borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding:'8px 24px',marginBottom:8 }}>
            <div style={{ fontSize:13,color:'rgba(255,255,255,0.8)',fontWeight:600 }}>{user?.firstName} {user?.lastName}</div>
            <span style={{ fontSize:11,background:'rgba(124,58,237,0.3)',color:'#c4b5fd',padding:'2px 8px',borderRadius:10,fontWeight:600 }}>Super Admin</span>
          </div>
          <Link to="/" className="sidebar-link"><Package size={17} />View Site</Link>
          <button onClick={handleLogout} className="sidebar-link"><LogOut size={17} />Sign Out</button>
        </div>
      </aside>
      <main className="dashboard-main">{pages[active]}</main>
    </div>
  );
}
