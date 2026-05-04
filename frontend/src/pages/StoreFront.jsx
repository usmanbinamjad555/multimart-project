import Img from "../components/common/Img";
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tenantAPI, productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { Star, Package, MapPin, Phone, Mail, Search, Filter } from 'lucide-react';

export default function StoreFront() {
  const { tenantSlug } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    Promise.all([tenantAPI.getOne(tenantSlug), categoryAPI.getAll(tenantSlug)])
      .then(([store, cats]) => { setStoreData(store.data.data); setCategories(cats.data.data || []); })
      .catch(console.error);
  }, [tenantSlug]);

  useEffect(() => {
    if (!storeData) return;
    setLoading(true);
    productAPI.getAll(tenantSlug, { page, limit: 12, category: selectedCat || undefined, search: search || undefined })
      .then(({ data }) => { setProducts(data.data); setTotalPages(data.pages); })
      .finally(() => setLoading(false));
  }, [tenantSlug, storeData, selectedCat, search, page]);

  if (!storeData && loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!storeData) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><h2>Store not found</h2></div>;

  const { tenant } = storeData;

  return (
    <div>
      {/* Store Banner */}
      <div style={{ background: 'var(--secondary)', padding: '36px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <Img src={tenant.logo} alt={tenant.name} fallbackText={tenant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'white' }}>{tenant.name}</h1>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{tenant.category}</span>
              </div>
              {tenant.description && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 12 }}>{tenant.description}</p>}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {tenant.stats?.rating > 0 && <span style={{ color: '#f59e0b', fontSize: 14, fontWeight: 600 }}>★ {tenant.stats.rating} ({tenant.stats.reviewCount} reviews)</span>}
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}><Package size={14} /> {tenant.stats?.totalProducts || 0} Products</span>
                {tenant.address?.city && <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {tenant.address.city}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 28 }}>
          {/* Sidebar */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Categories</div>
              <button onClick={() => setSelectedCat('')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 0', fontSize: 14, color: !selectedCat ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: !selectedCat ? 700 : 400, border: 'none', background: 'none', cursor: 'pointer' }}>All Products</button>
              {categories.map(c => (
                <button key={c._id} onClick={() => setSelectedCat(c._id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 0', fontSize: 14, color: selectedCat === c._id ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: selectedCat === c._id ? 700 : 400, border: 'none', background: 'none', cursor: 'pointer' }}>{c.name}</button>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Contact</div>
              {tenant.contactEmail && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}><Mail size={13} />{tenant.contactEmail}</div>}
              {tenant.contactPhone && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><Phone size={13} />{tenant.contactPhone}</div>}
            </div>
          </div>

          {/* Products Grid */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="Search in this store..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
                {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 280 }} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state"><Package size={48} /><h3>No products found</h3><p>Try different filters</p></div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
                  {products.map(p => <ProductCard key={p._id} product={p} tenantSlug={tenantSlug} />)}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
