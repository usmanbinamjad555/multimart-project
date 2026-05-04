import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { Search } from 'lucide-react';

export default function SearchResults() {
  const [sp, setSp] = useSearchParams();
  const query = sp.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(query);

  useEffect(() => {
    if (!query || query.length < 2) return;
    setLoading(true);
    searchAPI.global({ q: query, limit: 24 }).then(r => { setResults(r.data.data||[]); setTotal(r.data.total||0); }).catch(() => {}).finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e) => { e.preventDefault(); if(search.trim()) setSp({ q: search.trim() }); };

  return (
    <div className="container" style={{ padding:'40px 24px' }}>
      <form onSubmit={handleSearch} style={{ marginBottom:28,display:'flex',gap:10,maxWidth:560 }}>
        <div style={{ position:'relative',flex:1 }}>
          <Search size={16} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)' }} />
          <input className="input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products across all stores..." style={{ paddingLeft:38 }} />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      {query && <div style={{ marginBottom:24 }}><span style={{ fontFamily:'var(--font-display)',fontSize:22,fontWeight:800 }}>"{query}"</span><span style={{ color:'var(--text-muted)',marginLeft:10,fontSize:15 }}>{total} results</span></div>}
      {loading ? (
        <div className="grid-4">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton" style={{ height:280 }} />)}</div>
      ) : results.length === 0 && query ? (
        <div className="empty-state"><Search size={52} /><h3>No results for "{query}"</h3><p>Try different keywords or browse our stores</p><Link to="/stores" className="btn btn-primary" style={{ marginTop:16 }}>Browse Stores</Link></div>
      ) : (
        <div className="grid-4">
          {results.map(p => (
            <ProductCard key={p._id + (p.tenant?.slug||'')} product={p} tenantSlug={p.tenant?.slug} tenantName={p.tenant?.name} />
          ))}
        </div>
      )}
      {!query && (
        <div style={{ textAlign:'center',padding:'60px 0' }}>
          <Search size={64} style={{ margin:'0 auto 20px',opacity:0.2 }} />
          <h2 style={{ fontFamily:'var(--font-display)',fontSize:24,marginBottom:10 }}>Search MultiMart</h2>
          <p style={{ color:'var(--text-muted)' }}>Find products and services from all our stores</p>
        </div>
      )}
    </div>
  );
}
