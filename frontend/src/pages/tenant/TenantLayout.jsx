import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TenantDashboard from './TenantDashboard';
import TenantProducts from './TenantProducts';
import TenantOrders from './TenantOrders';
import TenantCategories from './TenantCategories';
import { LayoutDashboard, Package, ShoppingBag, Tag, LogOut, Store, ExternalLink } from 'lucide-react';

export default function TenantLayout() {
  const [active, setActive] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const tenantSlug = user?.tenantId?.slug;

  const handleLogout = () => { logout(); navigate('/login'); };
  const pages = { dashboard:<TenantDashboard />, products:<TenantProducts />, orders:<TenantOrders />, categories:<TenantCategories /> };

  // Show pending message if store not active
  if (user?.tenantId?.status === 'pending') {
    return (
      <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)' }}>
        <div style={{ textAlign:'center',padding:40,maxWidth:400 }}>
          <div style={{ width:72,height:72,borderRadius:'50%',background:'#fef3c7',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px' }}>
            <Store size={32} color="#d97706" />
          </div>
          <h2 style={{ fontFamily:'var(--font-display)',fontSize:22,fontWeight:800,marginBottom:10 }}>Store Pending Approval</h2>
          <p style={{ color:'var(--text-muted)',marginBottom:24 }}>Your store "{user?.tenantId?.name}" is being reviewed by our team. You'll receive access within 24 hours.</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden' }}>
              {user?.tenantId?.logo ? <img src={user.tenantId.logo} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt="" /> : <Package size={16} color="white" />}
            </div>
            <div>
              <div style={{ color:'white',fontSize:14,fontWeight:700,lineHeight:1.2 }}>{user?.tenantId?.name || 'My Store'}</div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,0.4)' }}>Store Admin</div>
            </div>
          </div>
        </div>
        <div>
          <div className="sidebar-section-title">Store</div>
          {[['dashboard',LayoutDashboard,'Dashboard'],['products',Package,'Products'],['orders',ShoppingBag,'Orders'],['categories',Tag,'Categories']].map(([key,Icon,label]) => (
            <button key={key} onClick={() => setActive(key)} className={`sidebar-link ${active===key?'active':''}`}><Icon size={17} />{label}</button>
          ))}
        </div>
        <div style={{ marginTop:'auto',padding:'16px 0',borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          {tenantSlug && <Link to={`/stores/${tenantSlug}`} className="sidebar-link"><ExternalLink size={17} />View Store</Link>}
          <Link to="/" className="sidebar-link"><Store size={17} />MultiMart Home</Link>
          <button onClick={handleLogout} className="sidebar-link"><LogOut size={17} />Sign Out</button>
        </div>
      </aside>
      <main className="dashboard-main">{pages[active]}</main>
    </div>
  );
}
