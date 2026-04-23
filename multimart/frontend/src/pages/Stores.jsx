import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tenantAPI } from '../services/api';
import TenantCard from '../components/common/TenantCard';
import { Search, Filter } from 'lucide-react';

const CATS = ['All','Electronics','Fashion','Home & Garden','Sports','Books','Food & Grocery','Health & Beauty','Services'];

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    tenantAPI.getAll({ category: category || undefined, search: search || undefined, limit: 20 })
      .then(({ data }) => { setStores(data.data); setTotal(data.total); })
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="section-header">
        <div>
          <div className="section-title">All Stores</div>
          <div className="section-subtitle">{total} stores on MultiMart</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search stores..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setSearchParams(c && c !== 'All' ? { category: c } : {})}
              className={`btn btn-sm ${(c === 'All' && !category) || c === category ? 'btn-primary' : 'btn-outline'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid-3">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 220 }} />)}</div>
      ) : stores.length === 0 ? (
        <div className="empty-state"><Search size={48} /><h3>No stores found</h3><p>Try a different category or search term</p></div>
      ) : (
        <div className="grid-3">{stores.map(t => <TenantCard key={t._id} tenant={t} />)}</div>
      )}
    </div>
  );
}
