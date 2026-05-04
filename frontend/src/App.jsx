import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterStore from './pages/RegisterStore';
import Stores from './pages/Stores';
import StoreFront from './pages/StoreFront';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';

// Admin
import AdminLayout from './pages/superadmin/AdminLayout';

// Tenant
import TenantLayout from './pages/tenant/TenantLayout';

// Protected Route
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Layout wrapper with Navbar + Footer
const PublicLayout = ({ children }) => (
  <div className="page-wrapper">
    <Navbar />
    <main style={{ flex:1 }}>{children}</main>
    <Footer />
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-store" element={<RegisterStore />} />

      {/* Public */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/stores" element={<PublicLayout><Stores /></PublicLayout>} />
      <Route path="/stores/:tenantSlug" element={<PublicLayout><StoreFront /></PublicLayout>} />
      <Route path="/stores/:tenantSlug/product/:productId" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/search" element={<PublicLayout><SearchResults /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />

      {/* Protected Customer */}
      <Route path="/checkout" element={<ProtectedRoute><PublicLayout><Checkout /></PublicLayout></ProtectedRoute>} />

      {/* Super Admin */}
      <Route path="/admin/*" element={<ProtectedRoute roles={['superadmin']}><div style={{ paddingTop:70, marginTop:-70 }}><Navbar /><AdminLayout /></div></ProtectedRoute>} />

      {/* Tenant Admin */}
      <Route path="/tenant/*" element={<ProtectedRoute roles={['tenant_admin']}><div style={{ paddingTop:70, marginTop:-70 }}><Navbar /><TenantLayout /></div></ProtectedRoute>} />

      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration:3000, style:{ fontFamily:'var(--font-body)',fontSize:14,borderRadius:10 } }} />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
