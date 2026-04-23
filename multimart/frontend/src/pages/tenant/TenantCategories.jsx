import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { categoryAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TenantCategories() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantId?.slug;
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'',description:'',image:'',sortOrder:0 });
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); categoryAPI.getAll(tenantSlug).then(r => setCats(r.data.data||[])).finally(() => setLoading(false)); };
  useEffect(() => { if(tenantSlug) load(); }, [tenantSlug]);

  const openCreate = () => { setEditing(null); setForm({ name:'',description:'',image:'',sortOrder:cats.length }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c._id); setForm(c); setShowModal(true); };
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await categoryAPI.update(tenantSlug, editing, form);
      else await categoryAPI.create(tenantSlug, form);
      toast.success(editing ? 'Category updated' : 'Category created');
      setShowModal(false); load();
    } finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await categoryAPI.delete(tenantSlug, id);
    toast.success('Category deleted'); load();
  };

  return (
    <div className="animate-fade">
      <div className="section-header">
        <div><div className="section-title">Categories</div><div className="section-subtitle">{cats.length} categories</div></div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Add Category</button>
      </div>
      {loading ? <div className="loading-center"><div className="spinner" /></div> : cats.length === 0 ? (
        <div className="empty-state"><Tag size={52} /><h3>No categories yet</h3><p>Organize your products with categories</p><button onClick={openCreate} className="btn btn-primary" style={{ marginTop:16 }}><Plus size={16} /> Add Category</button></div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>
          {cats.map(c => (
            <div key={c._id} style={{ background:'white',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:20 }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
                <div style={{ fontWeight:700,fontSize:15 }}>{c.name}</div>
                <div style={{ display:'flex',gap:6 }}>
                  <button onClick={() => openEdit(c)} className="btn btn-sm btn-outline"><Edit2 size={12} /></button>
                  <button onClick={() => handleDelete(c._id)} style={{ width:28,height:28,borderRadius:6,border:'1px solid var(--border)',background:'none',color:'var(--error)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Trash2 size={12} /></button>
                </div>
              </div>
              {c.description && <div style={{ fontSize:13,color:'var(--text-secondary)' }}>{c.description}</div>}
              <div style={{ marginTop:8,fontSize:12,color:'var(--text-muted)' }}>{c.productCount||0} products</div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Category' : 'Add Category'}</div>
              <button onClick={() => setShowModal(false)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:20,color:'var(--text-muted)' }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div className="input-group"><label className="input-label">Category Name *</label><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
              <div className="input-group"><label className="input-label">Description</label><textarea className="input" rows={2} value={form.description||''} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
              <div className="input-group"><label className="input-label">Image URL</label><input className="input" value={form.image||''} onChange={e=>setForm(p=>({...p,image:e.target.value}))} /></div>
              <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
