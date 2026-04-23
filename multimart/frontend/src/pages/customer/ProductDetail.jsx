// ProductDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { ShoppingCart, ArrowLeft, Star, Package, Truck, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { slug, productId } = useParams()
  const { addToCart, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    productAPI.getById(slug, productId)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }, [slug, productId])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!data) return <div className="page-loader"><p>Product not found</p></div>

  const { product, reviews, relatedProducts } = data
  const discountPct = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0

  const handleAddToCart = () => {
    addToCart(slug, product, qty)
  }

  const handleBuyNow = () => {
    addToCart(slug, product, qty)
    navigate(`/store/${slug}/cart`)
  }

  return (
    <div className="page">
      <div className="container">
        <Link to={`/store/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to store
        </Link>

        <div style={s.layout}>
          {/* Images */}
          <div style={s.imgSection}>
            <div style={s.mainImg}>
              <img src={product.images?.[activeImg]?.url || `https://via.placeholder.com/500?text=${product.name}`}
                alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {discountPct > 0 && <span style={s.badge}>-{discountPct}% OFF</span>}
            </div>
            {product.images?.length > 1 && (
              <div style={s.thumbRow}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{ ...s.thumb, ...(activeImg === i ? s.thumbActive : {}) }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={s.info}>
            {product.categoryName && <span style={s.catLabel}>{product.categoryName}</span>}
            <h1 style={s.name}>{product.name}</h1>

            <div style={s.ratingRow}>
              <div style={{ color: 'var(--brand-accent)', display: 'flex', gap: 2 }}>
                {'★'.repeat(Math.round(product.stats?.rating || 0))}
                {'☆'.repeat(5 - Math.round(product.stats?.rating || 0))}
              </div>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{product.stats?.rating?.toFixed(1) || '—'}</span>
              <span style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>({product.stats?.reviewCount || 0} reviews)</span>
              <span style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>· {product.stats?.purchases || 0} sold</span>
            </div>

            <div style={s.priceBox}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                PKR {product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--gray-400)' }}>
                  PKR {product.compareAtPrice.toLocaleString()}
                </span>
              )}
              {discountPct > 0 && <span className="price-discount">{discountPct}% off</span>}
            </div>

            <p style={s.desc}>{product.shortDescription || product.description?.slice(0, 200)}</p>

            {!product.isService && (
              <p style={{ fontSize: '0.875rem', color: product.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600, marginBottom: 20 }}>
                {product.stock > 5 ? '✓ In Stock' : product.stock > 0 ? `⚠ Only ${product.stock} left` : '✗ Out of Stock'}
              </p>
            )}

            {/* Qty + Actions */}
            <div style={s.actions}>
              {!product.isService && (
                <div style={s.qtyControl}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={s.qtyBtn}>−</button>
                  <span style={s.qtyNum}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={s.qtyBtn}>+</button>
                </div>
              )}
              <button className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 && !product.isService}
                style={{ flex: 1 }}>
                <ShoppingCart size={18} /> {product.isService ? 'Book Now' : 'Add to Cart'}
              </button>
            </div>
            <button className="btn btn-dark btn-full btn-lg" onClick={handleBuyNow}
              disabled={product.stock === 0 && !product.isService} style={{ marginTop: 10 }}>
              Buy Now
            </button>

            {/* Trust badges */}
            <div style={s.trust}>
              <div style={s.trustItem}><Truck size={16} /><span>Free delivery over PKR 2,000</span></div>
              <div style={s.trustItem}><Shield size={16} /><span>Secure payment</span></div>
              <div style={s.trustItem}><Package size={16} /><span>Easy returns</span></div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Product Description</h2>
          <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{product.description}</p>
        </div>

        {/* Reviews */}
        {reviews?.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Customer Reviews ({reviews.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(r => (
                <div key={r._id} style={s.reviewCard}>
                  <div style={s.reviewHeader}>
                    <div style={s.reviewAvatar}>{r.customerName?.[0] || 'U'}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.customerName}</div>
                      <div style={{ color: 'var(--brand-accent)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    {r.isVerifiedPurchase && <span className="badge badge-success" style={{ marginLeft: 'auto' }}>✓ Verified</span>}
                  </div>
                  {r.title && <div style={{ fontWeight: 600, marginBottom: 6 }}>{r.title}</div>}
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {relatedProducts?.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Related Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {relatedProducts.map(p => (
                <Link key={p._id} to={`/store/${slug}/product/${p._id}`} style={s.relCard}>
                  <img src={p.images?.[0]?.url || `https://via.placeholder.com/200?text=${p.name}`} alt={p.name} style={s.relImg} />
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>PKR {p.price.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 48 },
  imgSection: { display: 'flex', flexDirection: 'column', gap: 12 },
  mainImg: { position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--gray-100)', border: '1.5px solid var(--gray-200)' },
  badge: { position: 'absolute', top: 16, left: 16, background: 'var(--danger)', color: '#fff', padding: '4px 12px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem' },
  thumbRow: { display: 'flex', gap: 8 },
  thumb: { width: 72, height: 72, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent', background: 'var(--gray-100)' },
  thumbActive: { borderColor: 'var(--brand-primary)' },
  info: { display: 'flex', flexDirection: 'column' },
  catLabel: { display: 'inline-block', background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '3px 12px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, marginBottom: 12 },
  name: { fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 },
  priceBox: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', borderTop: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)', marginBottom: 20 },
  desc: { color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 24 },
  actions: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 0 },
  qtyControl: { display: 'flex', alignItems: 'center', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)' },
  qtyBtn: { width: 36, height: 44, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-700)' },
  qtyNum: { width: 44, textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-display)' },
  trust: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' },
  trustItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--gray-600)' },
  section: { padding: '32px 0', borderTop: '1px solid var(--gray-200)' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 },
  reviewCard: { background: '#fff', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 20 },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  reviewAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  relCard: { background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--gray-200)', overflow: 'hidden', textDecoration: 'none', color: 'inherit' },
  relImg: { width: '100%', aspectRatio: '1', objectFit: 'cover', background: 'var(--gray-100)' },
}
