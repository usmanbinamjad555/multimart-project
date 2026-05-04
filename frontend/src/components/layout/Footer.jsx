import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
export default function Footer() {
  return (
    <footer style={{ background:'var(--secondary)',color:'rgba(255,255,255,0.55)',padding:'48px 0 24px',marginTop:'auto' }}>
      <div className="container">
        <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:32,marginBottom:40 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16 }}>
              <div style={{ width:32,height:32,background:'var(--primary)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center' }}><Package size={18} color="white" /></div>
              <span style={{ fontFamily:'var(--font-display)',fontSize:18,fontWeight:800,color:'white' }}>Multi<span style={{ color:'var(--primary)' }}>Mart</span></span>
            </div>
            <p style={{ fontSize:14,lineHeight:1.7 }}>Pakistan's leading multi-vendor marketplace connecting buyers and sellers across the country.</p>
          </div>
          {[['Quick Links',[['/',  'Home'],['/stores','All Stores'],['/search','Search']]],['Sell on MultiMart',[['/register-store','Open a Store'],['/login','Seller Login']]],['Support',[['/','Help Center'],['/','Contact Us']]]].map(([title,links]) => (
            <div key={title}>
              <div style={{ fontWeight:700,color:'white',fontSize:14,marginBottom:14 }}>{title}</div>
              {links.map(([path,label]) => <div key={label}><Link to={path} style={{ fontSize:13,color:'rgba(255,255,255,0.55)',display:'block',marginBottom:8,transition:'color 0.2s' }} onMouseEnter={e=>e.target.style.color='white'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.55)'}>{label}</Link></div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13 }}>
          <span>© 2024 MultiMart. All rights reserved.</span>
          <span>Built with MERN Stack • Multi-Tenant Architecture</span>
        </div>
      </div>
    </footer>
  );
}
