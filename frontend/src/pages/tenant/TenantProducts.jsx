import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productAPI, categoryAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const fmt = (p) => `PKR ${Number(p||0).toLocaleString()}`;

const EMPTY_PRODUCT = { name:'', description:'', price:'', compareAtPrice:'', stock:'', categoryId:'', isService:false, isFeatured:false, images:[{url:'',isPrimary:true}], tags:'' };

export default function TenantProducts() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantId?.slug;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const load = () => {
    setLoading(true);
    Promise.all([
      productAPI.adminGetAll(tenantSlug, { search, limit: 30 }),
      categoryAPI.getAll(tenantSlug)
    ]).then(([p, c]) => { setProducts(p.data.data); setTotal(p.data.total); setCategories(c.data.data||[]); }).finally(() => setLoading(false));
  };
  useEffect(() => { if(tenantSlug) load(); }, [tenantSlug, search]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_PRODUCT); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ ...p, tags: (p.tags||[]).join(','), images: p.images?.length ? p.images : [{url:'',isPrimary:true}] });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined, stock: Number(form.stock||0), tags: form.tags ? form.tags.split(',').map(t=>t.trim()) : [], images: form.images.filter(i=>i.url) };
      if (editing) await productAPI.update(tenantSlug, editing, payload);
      else await productAPI.create(tenantSlug, payload);
      toast.success(editing ? 'Product updated!' : 'Product created!');
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this product?')) return;
    await productAPI.delete(tenantSlug, id);
    toast.success('Product removed');
    load();
  };

  return (
    <div className="animate-fade">
      <div className="section-header">
        <div><div className="section-title">Products</div><div className="section-subtitle">{total} products</div></div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Add Product</button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft: 34, width: 280 }} />
        </div>
      </div>
      {loading ? <div className="loading-center"><div className="spinner" /></div> : products.length === 0 ? (
        <div className="empty-state"><Package size={52} /><h3>No products yet</h3><p>Add your first product to start selling</p><button onClick={openCreate} className="btn btn-primary" style={{ marginTop:16 }}><Plus size={16} /> Add Product</button></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg)', overflow: 'hidden', flexShrink: 0 }}>
                        {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--text-muted)' }}>No img</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight:600,fontSize:14 }}>{p.name}</div>
                        {p.isService && <span className="badge badge-purple" style={{ fontSize:10 }}>Service</span>}
                        {p.isFeatured && <span className="badge badge-orange" style={{ fontSize:10,marginLeft:4 }}>Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:13,color:'var(--text-secondary)' }}>{p.categoryName || '—'}</td>
                  <td>
                    <div style={{ fontWeight:700,fontSize:14 }}>{fmt(p.price)}</div>
                    {p.compareAtPrice > p.price && <div style={{ fontSize:11,color:'var(--text-muted)',textDecoration:'line-through' }}>{fmt(p.compareAtPrice)}</div>}
                  </td>
                  <td>
                    <span style={{ fontWeight:600,color: p.isService ? 'var(--success)' : p.stock>5?'var(--success)':p.stock>0?'var(--warning)':'var(--error)' }}>
                      {p.isService ? '∞' : p.stock}
                    </span>
                  </td>
                  <td><span className={`badge badge-${p.isActive?'success':'error'}`}>{p.isActive?'Active':'Inactive'}</span></td>
                  <td>
                    <div style={{ display:'flex',gap:6 }}>
                      <button onClick={() => openEdit(p)} className="btn btn-sm btn-outline"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(p._id)} style={{ width:30,height:30,borderRadius:6,border:'1px solid var(--border)',background:'none',color:'var(--error)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</div>
              <button onClick={() => setShowModal(false)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:20,color:'var(--text-muted)' }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div className="input-group"><label className="input-label">Product Name *</label><input className="input" value={form.name} onChange={e=>set('name',e.target.value)} required /></div>
              <div className="input-group"><label className="input-label">Description *</label><textarea className="input" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} required style={{ resize:'vertical' }} /></div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div className="input-group"><label className="input-label">Price (PKR) *</label><input className="input" type="number" value={form.price} onChange={e=>set('price',e.target.value)} required min={0} /></div>
                <div className="input-group"><label className="input-label">Compare At Price</label><input className="input" type="number" value={form.compareAtPrice} onChange={e=>set('compareAtPrice',e.target.value)} min={0} /></div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="select" value={form.categoryId} onChange={e=>set('categoryId',e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="input-group"><label className="input-label">Stock Quantity</label><input className="input" type="number" value={form.stock} onChange={e=>set('stock',e.target.value)} min={0} /></div>
              </div>
              <div className="input-group"><label className="input-label">Image URL</label><input className="input" value={form.images?.[0]?.url||''} onChange={e=>set('images',[{url:e.target.value,isPrimary:true}])} placeholder="https://..." /></div>
              <div className="input-group"><label className="input-label">Tags (comma separated)</label><input className="input" value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="electronics, phone, samsung" /></div>
              <div style={{ display:'flex',gap:16 }}>
                <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14 }}>
                  <input type="checkbox" checked={form.isService} onChange={e=>set('isService',e.target.checked)} style={{ accentColor:'var(--primary)' }} /> Is a Service
                </label>
                <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14 }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e=>set('isFeatured',e.target.checked)} style={{ accentColor:'var(--primary)' }} /> Featured
                </label>
                <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14 }}>
                  <input type="checkbox" checked={form.isActive!==false} onChange={e=>set('isActive',e.target.checked)} style={{ accentColor:'var(--primary)' }} /> Active
                </label>
              </div>
              <div style={{ display:'flex',gap:10,justifyContent:'flex-end',marginTop:8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editing ? 'Update Product' : 'Create Product')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
