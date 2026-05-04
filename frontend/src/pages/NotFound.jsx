import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div style={{ minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center' }}>
      <div>
        <div style={{ fontFamily:'var(--font-display)',fontSize:120,fontWeight:800,color:'var(--border)',lineHeight:1 }}>404</div>
        <h2 style={{ fontFamily:'var(--font-display)',fontSize:26,marginBottom:12 }}>Page Not Found</h2>
        <p style={{ color:'var(--text-muted)',marginBottom:28 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary btn-lg">Back to Home</Link>
      </div>
    </div>
  );
}
