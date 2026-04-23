import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { tenantAPI, productAPI, categoryAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { ShoppingCart, Search, Star, SlidersHorizontal, Store } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StoreFront() {
  const { slug } = useParams()
  const { addToCart } = useAuth()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const load = async () => {
      try {
        const [storeRes, catRes] = await Promise.all([
          tenantAPI.getBySlug(slug),
          categoryAPI.getAll(slug),
        ])
        setStore(storeRes.data.data.tenant)
        setCategories(catRes.data.data)
      } catch { toast.error('Store not found') }
    }
    load()
  }, [slug])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = { page, limit: 12, ...filters }
        Object.keys(params).forEach(k => !params[k] && delete params[k])
        const res = await productAPI.getAll(slug, params)
        setProducts(res.data.data)
        setTotalPages(res.data.pages)
      } catch { toast.error('Failed to load products') }
      finally { setLoading(false) }
    }
    if (store) load()
  }, [slug, filters, page, store])

  if (!store && loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!store) return <div className="page-loader"><p>Store not found</p></div>

  return (
    <div>
      {/* Store Banner */}
      <div style={{ ...s.banner, background: `hsl(${store.name.charCodeAt(0) * 5}, 55%, 35%)` }}>
        {store.banner && <img src={store.banner} alt="" style={s.bannerImg} />}
        <div style={s.bannerOverlay} />
        <div className="container" style={s.bannerContent}>
          <div style={s.storeLogoWrap}>
            {store.logo ? <img src={store.logo} alt={store.name} style={s.storeLogo} />
              : <div style={{ ...s.storeLogo, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--brand-primary)' }}>{store.name[0]}</div>}
          </div>
          <div>
            <h1 style={s.storeName}>{store.name}</h1>
            <p style={s.storeDesc}>{store.description}</p>
            <div style={s.storeMeta}>
              <span style={s.metaItem}>⭐ {store.stats?.rating?.toFixed(1) || '—'} ({store.stats?.reviewCount || 0} reviews)</span>
              <span style={s.metaDot}>·</span>
              <span style={s.metaItem}>🛍️ {store.stats?.totalProducts || 0} products</span>
              <span style={s.metaDot}>·</span>
              <span style={s.metaItem}>📍 {store.address?.city || 'Pakistan'}</span>
              <span style={s.metaDot}>·</span>
              <span style={{ ...s.metaItem, background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', padding: '2px 10px', borderRadius: 999 }}>✓ Verified Store</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={s.layout}>
          {/* Sidebar */}
          <aside style={s.sidebar}>
            <div style={s.filterCard}>
              <h3 style={s.filterTitle}><SlidersHorizontal size={16} /> Filters</h3>
              <div style={s.filterSection}>
                <label style={s.filterLabel}>Search</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                  <input className="input" style={{ paddingLeft: 32, fontSize: '0.85rem' }}
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1) }} />
                </div>
              </div>
              {categories.length > 0 && (
                <div style={s.filterSection}>
                  <label style={s.filterLabel}>Category</label>
                  <div style={s.catList}>
                    <button style={{ ...s.catItem, ...(filters.category === '' ? s.catActive : {}) }}
                      onClick={() => { setFilters(f => ({ ...f, category: '' })); setPage(1) }}>All Categories</button>
                    {categories.map(c => (
                      <button key={c._id} style={{ ...s.catItem, ...(filters.category === c._id ? s.catActive : {}) }}
                        onClick={() => { setFilters(f => ({ ...f, category: c._id })); setPage(1) }}>
                        {c.name} <span style={s.catCount}>{c.productCount || ''}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={s.filterSection}>
                <label style={s.filterLabel}>Price Range (PKR)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" style={{ fontSize: '0.82rem' }} type="number" placeholder="Min"
                    value={filters.minPrice} onChange={e => { setFilters(f => ({ ...f, minPrice: e.target.value })); setPage(1) }} />
                  <input className="input" style={{ fontSize: '0.82rem' }} type="number" placeholder="Max"
                    value={filters.maxPrice} onChange={e => { setFilters(f => ({ ...f, maxPrice: e.target.value })); setPage(1) }} />
                </div>
              </div>
              <div style={s.filterSection}>
                <label style={s.filterLabel}>Sort By</label>
                <select className="select" style={{ fontSize: '0.85rem' }} value={filters.sort}
                  onChange={e => { setFilters(f => ({ ...f, sort: e.target.value })); setPage(1) }}>
                  <option value="-createdAt">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-stats.rating">Top Rated</option>
                  <option value="-stats.purchases">Best Sellers</option>
                </select>
              </div>
              <button className="btn btn-ghost btn-full btn-sm"
                onClick={() => { setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt' }); setPage(1) }}>
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <main style={{ flex: 1 }}>
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <Store size={48} />
                <h3>No Products Found</h3>
                <p>Try different filters</p>
              </div>
            ) : (
              <>
                <div style={s.productsGrid}>
                  {products.map(p => (
                    <ProductCard key={p._id} product={p} storeSlug={slug} onAddToCart={() => addToCart(slug, p)} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div style={s.pagination}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        style={{ ...s.pageBtn, ...(page === p ? s.pageBtnActive : {}) }}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, storeSlug, onAddToCart }) {
  const discountPct = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0

  return (
    <div style={s.productCard}>
      <Link to={`/store/${storeSlug}/product/${product._id}`}>
        <div style={s.imgWrap}>
          <img src={product.images?.[0]?.url || `https://via.placeholder.com/300x300?text=${product.name}`}
            alt={product.name} style={s.productImg} />
          {discountPct > 0 && <span style={s.discountBadge}>-{discountPct}%</span>}
          {product.isService && <span style={s.serviceBadge}>Service</span>}
          {product.stock === 0 && !product.isService && <div style={s.outOfStock}>Out of Stock</div>}
        </div>
      </Link>
      <div style={s.productBody}>
        <Link to={`/store/${storeSlug}/product/${product._id}`} style={{ textDecoration: 'none' }}>
          <h4 style={s.productName}>{product.name}</h4>
        </Link>
        <div style={s.productRating}>
          {'★'.repeat(Math.round(product.stats?.rating || 0))}{'☆'.repeat(5 - Math.round(product.stats?.rating || 0))}
          <span style={s.ratingNum}>{product.stats?.rating?.toFixed(1) || ''}</span>
        </div>
        <div style={s.priceRow}>
          <span className="price">PKR {product.price.toLocaleString()}</span>
          {product.compareAtPrice && <span className="price-original">PKR {product.compareAtPrice.toLocaleString()}</span>}
        </div>
        <button className="btn btn-primary btn-full btn-sm"
          disabled={product.stock === 0 && !product.isService}
          onClick={onAddToCart} style={{ marginTop: 8 }}>
          <ShoppingCart size={14} /> {product.isService ? 'Book Now' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

const s = {
  banner: { position: 'relative', padding: '48px 0', overflow: 'hidden' },
  bannerImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  bannerOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' },
  bannerContent: { position: 'relative', display: 'flex', alignItems: 'center', gap: 24, color: '#fff' },
  storeLogoWrap: { flexShrink: 0 },
  storeLogo: { width: 80, height: 80, borderRadius: 16, border: '3px solid rgba(255,255,255,0.3)', objectFit: 'cover' },
  storeName: { fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: 6 },
  storeDesc: { opacity: 0.8, fontSize: '0.95rem', maxWidth: 500, marginBottom: 12, lineHeight: 1.6 },
  storeMeta: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem' },
  metaItem: { opacity: 0.85 },
  metaDot: { opacity: 0.4 },
  layout: { display: 'flex', gap: 28, alignItems: 'flex-start' },
  sidebar: { width: 230, flexShrink: 0, position: 'sticky', top: 80 },
  filterCard: { background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--gray-200)', padding: 20 },
  filterTitle: { fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
  filterSection: { marginBottom: 20 },
  filterLabel: { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 },
  catList: { display: 'flex', flexDirection: 'column', gap: 2 },
  catItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--gray-700)', borderRadius: 8, textAlign: 'left', transition: 'background .12s' },
  catActive: { background: '#fde8e3', color: 'var(--brand-primary)', fontWeight: 600 },
  catCount: { fontSize: '0.72rem', color: 'var(--gray-400)' },
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32 },
  pageBtn: { width: 36, height: 36, border: '1.5px solid var(--gray-200)', borderRadius: 8, background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem' },
  pageBtnActive: { background: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', color: '#fff' },
  productCard: { background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--gray-200)', overflow: 'hidden', transition: 'all .18s' },
  imgWrap: { position: 'relative', aspectRatio: '1', overflow: 'hidden', background: 'var(--gray-100)' },
  productImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' },
  discountBadge: { position: 'absolute', top: 8, left: 8, background: 'var(--danger)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 7px', borderRadius: 999 },
  serviceBadge: { position: 'absolute', top: 8, right: 8, background: 'var(--info)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 7px', borderRadius: 999 },
  outOfStock: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' },
  productBody: { padding: '12px' },
  productName: { fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 },
  productRating: { color: 'var(--brand-accent)', fontSize: '0.75rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 },
  ratingNum: { color: 'var(--gray-600)', fontWeight: 600 },
  priceRow: { display: 'flex', gap: 8, alignItems: 'center' },
}
