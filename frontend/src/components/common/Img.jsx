/**
 * Img — Image with automatic fallback
 * Replaces broken images with a clean placeholder
 */
const FALLBACK_COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#0284c7','#7c3aed'];
const colorFor = (text='?') => FALLBACK_COLORS[text.charCodeAt(0) % FALLBACK_COLORS.length];

export default function Img({ src, alt = '', style = {}, className = '', fallbackText }) {
  const label = fallbackText || alt || '?';
  const color = colorFor(label);
  const initial = label.charAt(0).toUpperCase();

  const handleError = (e) => {
    // Replace broken img with an inline SVG placeholder
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (parent && !parent.querySelector('.img-fallback')) {
      const fb = document.createElement('div');
      fb.className = 'img-fallback';
      fb.style.cssText = `
        width:100%; height:100%; display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        background:${color}18; color:${color};
        font-family:var(--font-display); font-weight:800;
        font-size:clamp(18px, 4vw, 36px); gap:4px;
      `;
      fb.innerHTML = `
        <span>${initial}</span>
        <span style="font-size:10px;font-weight:600;opacity:0.6;text-align:center;padding:0 8px;line-height:1.3">${label}</span>
      `;
      parent.appendChild(fb);
    }
  };

  if (!src) {
    return (
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:`${color}18`, color, fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(18px,4vw,36px)', gap:4, ...style }}>
        <span>{initial}</span>
        <span style={{ fontSize:10, fontWeight:600, opacity:0.6, textAlign:'center', padding:'0 8px', lineHeight:1.3 }}>{label}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={className}
      onError={handleError}
    />
  );
}
