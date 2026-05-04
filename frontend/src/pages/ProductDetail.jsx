import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Package, Truck, Shield, Zap, ChevronRight } from 'lucide-react';
import Img from '../components/common/Img';
import toast from 'react-hot-toast';

const fmt = (p) => `PKR ${Number(p||0).toLocaleString()}`;

export default function ProductDetail() {
  const { tenantSlug, productId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    productAPI.getOne(tenantSlug, productId).then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [tenantSlug, productId]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!data) return <div className="container" style={{ padding:'80px 24px',textAlign:'center' }}><h2>Product not found</h2></div>;

  const { product, reviews, relatedProducts } = data;
  const effectivePrice = product.effectivePrice || product.price;
  const discount = product.compareAtPrice > product.price ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;

  const handleAddToCart = () => {
    addToCart({ productId: product._id, tenantSlug, name: product.name, price: effectivePrice, image: product.images?.[0]?.url, stock: product.stock, isService: product.isService, quantity: qty });
    toast.success('Added to cart!');
  };

  return (
    <div className="container" style={{ padding:'32px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:24,fontSize:13,color:'var(--text-muted)' }}>
        <Link to="/">Home</Link><ChevronRight size={13} /><Link to={`/stores/${tenantSlug}`}>{tenantSlug}</Link><ChevronRight size={13} /><span style={{ color:'var(--text-primary)' }}>{product.name}</span>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,marginBottom:48 }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius:'var(--radius-lg)',overflow:'hidden',background:'var(--bg)',marginBottom:12,aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Img src={product.images?.[activeImg]?.url} alt={product.name} fallbackText={product.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display:'flex',gap:8 }}>
              {product.images.map((img,i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ width:60,height:60,borderRadius:8,overflow:'hidden',border:`2px solid ${activeImg===i?'var(--primary)':'var(--border)'}`,background:'var(--bg)',cursor:'pointer',padding:0 }}>
                  <img src={img.url} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.isService && <span style={{ display:'inline-flex',alignItems:'center',gap:4,background:'var(--accent)',color:'white',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600,marginBottom:12 }}><Zap size={12} /> Service</span>}
          <h1 style={{ fontFamily:'var(--font-display)',fontSize:26,fontWeight:800,marginBottom:12,lineHeight:1.2 }}>{product.name}</h1>
          {product.stats?.rating > 0 && (
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16 }}>
              <div style={{ color:'#f59e0b' }}>{'★'.repeat(Math.round(product.stats.rating))}{'☆'.repeat(5-Math.round(product.stats.rating))}</div>
              <span style={{ fontSize:14,color:'var(--text-muted)' }}>({product.stats.reviewCount} reviews)</span>
            </div>
          )}
          <div style={{ marginBottom:20 }}>
            <span style={{ fontFamily:'var(--font-display)',fontSize:32,fontWeight:800,color:'var(--text-primary)' }}>{fmt(effectivePrice)}</span>
            {product.compareAtPrice > product.price && <>
              <span style={{ fontSize:18,color:'var(--text-muted)',textDecoration:'line-through',marginLeft:12 }}>{fmt(product.compareAtPrice)}</span>
              <span style={{ background:'var(--error)',color:'white',padding:'3px 8px',borderRadius:6,fontSize:12,fontWeight:700,marginLeft:8 }}>-{discount}%</span>
            </>}
          </div>
          <p style={{ color:'var(--text-secondary)',lineHeight:1.7,marginBottom:20,fontSize:15 }}>{product.shortDescription || product.description}</p>
          {!product.isService && (
            <div style={{ marginBottom:20,fontSize:14 }}>
              <span style={{ color: product.stock>5?'var(--success)':product.stock>0?'var(--warning)':'var(--error)', fontWeight:600 }}>
                {product.stock > 5 ? `✓ In Stock (${product.stock} available)` : product.stock > 0 ? `⚠ Low Stock (${product.stock} left)` : '✗ Out of Stock'}
              </span>
            </div>
          )}
          {(product.stock > 0 || product.isService) && (
            <div style={{ display:'flex',gap:12,marginBottom:24,alignItems:'center' }}>
              <div style={{ display:'flex',alignItems:'center',border:'1.5px solid var(--border)',borderRadius:8,overflow:'hidden' }}>
                <button onClick={() => setQty(Math.max(1,qty-1))} style={{ padding:'8px 14px',border:'none',background:'none',cursor:'pointer',fontSize:16 }}>−</button>
                <span style={{ padding:'8px 16px',fontWeight:700,borderLeft:'1px solid var(--border)',borderRight:'1px solid var(--border)' }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock||99,qty+1))} style={{ padding:'8px 14px',border:'none',background:'none',cursor:'pointer',fontSize:16 }}>+</button>
              </div>
              <button onClick={handleAddToCart} className="btn btn-primary btn-lg" style={{ flex:1 }}><ShoppingCart size={18} /> Add to Cart</button>
            </div>
          )}
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {[['🚚','Free shipping on orders over PKR 2,000'],['🔒','Secure & encrypted payments'],['↩','7-day easy returns']].map(([icon,text]) => (
              <div key={text} style={{ display:'flex',alignItems:'center',gap:10,fontSize:13,color:'var(--text-secondary)' }}><span style={{ fontSize:16 }}>{icon}</span>{text}</div>
            ))}
          </div>
          {product.isService && product.serviceDetails && (
            <div style={{ marginTop:20,background:'var(--bg)',borderRadius:'var(--radius-md)',padding:16 }}>
              <div style={{ fontWeight:700,fontSize:14,marginBottom:10 }}>Service Details</div>
              {[['Duration',product.serviceDetails.duration],['Delivery',product.serviceDetails.deliveryTime],['Areas',product.serviceDetails.serviceArea?.join(', ')]].filter(([,v])=>v).map(([k,v]) => (
                <div key={k} style={{ display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6 }}>
                  <span style={{ color:'var(--text-muted)' }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom:40 }}>
        <h2 style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:800,marginBottom:16 }}>Description</h2>
        <div style={{ background:'white',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:24,fontSize:15,lineHeight:1.8,color:'var(--text-secondary)' }}>{product.description}</div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div style={{ marginBottom:40 }}>
          <h2 style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:800,marginBottom:16 }}>Customer Reviews ({reviews.length})</h2>
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {reviews.map(r => (
              <div key={r._id} style={{ background:'white',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:20 }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700 }}>{r.customerName?.[0]}</div>
                    <div><div style={{ fontWeight:600,fontSize:14 }}>{r.customerName}</div>{r.isVerifiedPurchase && <span style={{ fontSize:11,color:'var(--success)',fontWeight:600 }}>✓ Verified Purchase</span>}</div>
                  </div>
                  <div style={{ color:'#f59e0b' }}>{'★'.repeat(r.rating)}</div>
                </div>
                {r.title && <div style={{ fontWeight:700,marginBottom:6 }}>{r.title}</div>}
                {r.comment && <div style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.6 }}>{r.comment}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:800,marginBottom:16 }}>Related Products</h2>
          <div className="grid-4">
            {relatedProducts.slice(0,4).map(p => (
              <div key={p._id} onClick={() => { window.scrollTo(0,0); }} >
                <Link to={`/stores/${tenantSlug}/product/${p._id}`} style={{ display:'block',background:'white',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',overflow:'hidden',transition:'var(--transition)' }}>
                  <div style={{ paddingTop:'75%',background:'var(--bg)',position:'relative' }}>
                    {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover' }} />}
                  </div>
                  <div style={{ padding:'12px 14px' }}>
                    <div style={{ fontSize:13,fontWeight:600,marginBottom:4 }}>{p.name}</div>
                    <div style={{ fontFamily:'var(--font-display)',fontSize:14,fontWeight:800 }}>PKR {(p.price||0).toLocaleString()}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
