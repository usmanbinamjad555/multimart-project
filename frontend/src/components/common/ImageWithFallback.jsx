import { useState } from 'react';
import { Package, Store, Image } from 'lucide-react';

/**
 * ImageWithFallback
 * Gracefully handles broken/missing images by showing a styled placeholder.
 * Use this everywhere instead of raw <img> tags.
 */
export default function ImageWithFallback({ src, alt, style, fallbackIcon: FallbackIcon = Image, containerStyle, className }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0ede8, #e8e4dc)', color: '#c0bdb6', ...containerStyle }}>
        <FallbackIcon size={28} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', ...containerStyle }}>
      {/* Skeleton while loading */}
      {!loaded && (
        <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
      )}
      <img
        src={src}
        alt={alt || ''}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease', ...style }}
        className={className}
      />
    </div>
  );
}
