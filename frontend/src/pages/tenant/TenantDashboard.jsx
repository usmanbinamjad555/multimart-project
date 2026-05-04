import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';
import { Package, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (p) => `PKR ${Number(p||0).toLocaleString()}`;

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
      <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
    </div>
  );
}

export default function TenantDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const tenantSlug = user?.tenantId?.slug;

  useEffect(() => {
    if (!tenantSlug) return;
    orderAPI.getAnalytics(tenantSlug).then(r => setAnalytics(r.data.data)).finally(() => setLoading(false));
  }, [tenantSlug]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const { totalOrders=0, pendingOrders=0, deliveredOrders=0, totalRevenue=0, avgOrderValue=0, last7Days=[] } = analytics || {};

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>Store Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.tenantId?.name} — Overview</p>
      </div>
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders} color="#6366f1" bg="#ede9fe" />
        <StatCard icon={Package} label="Pending" value={pendingOrders} color="#d97706" bg="#fef3c7" />
        <StatCard icon={TrendingUp} label="Delivered" value={deliveredOrders} color="#059669" bg="#d1fae5" />
        <StatCard icon={DollarSign} label="Revenue" value={fmt(totalRevenue)} color="#0284c7" bg="#dbeafe" />
      </div>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Revenue — Last 7 Days</div>
        {last7Days.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={last7Days}>
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => fmt(v)} />
              <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state" style={{ padding: '40px 0' }}><TrendingUp size={40} /><h3>No data yet</h3><p>Orders will appear here once customers start buying</p></div>
        )}
      </div>
    </div>
  );
}
