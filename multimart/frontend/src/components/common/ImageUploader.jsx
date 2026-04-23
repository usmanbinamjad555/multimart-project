import { useState, useRef } from 'react';
import { Upload, X, Image, Loader } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

/**
 * ImageUploader
 * Drag-and-drop OR click-to-select image upload component.
 * Uploads to /api/upload and returns the hosted URL.
 * onUpload(url) is called when upload succeeds.
 */
export default function ImageUploader({ currentUrl, onUpload, folder = 'products' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const [dragOver, setDragOver] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const inputRef = useRef(null);

  const doUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await API.post(`/upload?folder=${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreview(data.url);
      onUpload(data.url);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => doUpload(e.target.files?.[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); doUpload(e.dataTransfer.files?.[0]); };
  const handleUrlSubmit = () => {
    if (!manualUrl.trim()) return;
    setPreview(manualUrl.trim());
    onUpload(manualUrl.trim());
    setManualUrl('');
    toast.success('Image URL set!');
  };
  const clearImage = () => { setPreview(''); onUpload(''); };

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, background: 'var(--bg)', padding: 3, borderRadius: 8, width: 'fit-content' }}>
        {['upload', 'url'].map(t => (
          <button key={t} onClick={() => setTab(t)} type="button"
            style={{ padding: '5px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: tab === t ? 'white' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
            {t === 'upload' ? '📁 Upload File' : '🔗 Paste URL'}
          </button>
        ))}
      </div>

      {/* Current preview */}
      {preview && (
        <div style={{ position: 'relative', width: 120, height: 120, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--primary)', marginBottom: 10 }}>
          <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setPreview('')} />
          <button onClick={clearImage} type="button"
            style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {tab === 'upload' ? (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{ border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, padding: '24px 16px', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer', background: dragOver ? 'rgba(255,77,0,0.04)' : 'var(--bg)', transition: 'var(--transition)' }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Uploading...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Upload size={24} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Drop image here or click to browse</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG, PNG, WebP — max 5MB</span>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input" type="url" placeholder="https://example.com/image.jpg"
            value={manualUrl} onChange={e => setManualUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
          />
          <button type="button" onClick={handleUrlSubmit} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Set</button>
        </div>
      )}
    </div>
  );
}
