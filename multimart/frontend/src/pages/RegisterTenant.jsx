import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Store, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Food & Grocery', 'Health & Beauty', 'Automotive', 'Services', 'Other']

export default function RegisterTenant() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    storeName: '', storeDescription: '', storeCategory: '', storeEmail: '', storePhone: '',
    city: '', country: 'Pakistan',
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await authAPI.registerTenant({
        ...form,
        address: { city: form.city, country: form.country },
      })
      setSuccess(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={pg.page}>
      <div style={{ ...pg.card, textAlign: 'center', padding: '60px 40px' }} className="fade-up">
        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 12 }}>Application Submitted!</h2>
        <p style={{ color: 'var(--gray-500)', maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.7 }}>
          Your store application is under review. Our team will approve it within 24 hours. You'll be notified via email.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-primary">Login to Dashboard</Link>
          <Link to="/" className="btn btn-ghost">Back to Home</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={pg.page}>
      <div style={pg.card} className="fade-up">
        {/* Header */}
        <div style={pg.header}>
          <div style={pg.iconWrap}><Store size={24} color="var(--brand-primary)" /></div>
          <h1 style={pg.title}>Open Your Store</h1>
          <p style={pg.sub}>Join MultiMart's seller community</p>
        </div>

        {/* Steps indicator */}
        <div style={pg.steps}>
          {['Your Info', 'Store Details', 'Review'].map((label, i) => (
            <div key={label} style={pg.stepItem}>
              <div style={{ ...pg.stepDot, ...(step > i + 1 ? pg.stepDone : step === i + 1 ? pg.stepActive : {}) }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ ...pg.stepLabel, ...(step === i + 1 ? { color: 'var(--brand-primary)', fontWeight: 600 } : {}) }}>{label}</span>
              {i < 2 && <div style={{ ...pg.stepLine, ...(step > i + 1 ? { background: 'var(--success)' } : {}) }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div style={pg.form} className="fade-in">
            <h3 style={pg.stepTitle}>Personal Information</h3>
            <div className="form-row">
              <div className="form-group"><label>First Name</label>
                <input className="input" required value={form.firstName} onChange={set('firstName')} placeholder="Ali" /></div>
              <div className="form-group"><label>Last Name</label>
                <input className="input" required value={form.lastName} onChange={set('lastName')} placeholder="Hassan" /></div>
            </div>
            <div className="form-group"><label>Email Address</label>
              <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="ali@example.com" /></div>
            <div className="form-group"><label>Phone Number</label>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="0300-1234567" /></div>
            <div className="form-group"><label>Password</label>
              <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Min. 6 characters" /></div>
            <button className="btn btn-primary btn-full btn-lg"
              disabled={!form.firstName || !form.email || !form.password}
              onClick={() => setStep(2)}>
              Next: Store Details <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Store Info */}
        {step === 2 && (
          <div style={pg.form} className="fade-in">
            <h3 style={pg.stepTitle}>Store Information</h3>
            <div className="form-group"><label>Store Name *</label>
              <input className="input" required value={form.storeName} onChange={set('storeName')} placeholder="e.g. TechZone, FashionHub" /></div>
            <div className="form-group"><label>Category *</label>
              <select className="select" required value={form.storeCategory} onChange={set('storeCategory')}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Store Description</label>
              <textarea className="textarea" rows={3} value={form.storeDescription} onChange={set('storeDescription')} placeholder="Tell customers what you sell..." style={{ resize: 'vertical' }} /></div>
            <div className="form-row">
              <div className="form-group"><label>Store Email *</label>
                <input className="input" type="email" required value={form.storeEmail} onChange={set('storeEmail')} placeholder="store@example.com" /></div>
              <div className="form-group"><label>Store Phone</label>
                <input className="input" value={form.storePhone} onChange={set('storePhone')} placeholder="0300-0000000" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>City</label>
                <input className="input" value={form.city} onChange={set('city')} placeholder="Lahore" /></div>
              <div className="form-group"><label>Country</label>
                <input className="input" value={form.country} onChange={set('country')} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost btn-lg" onClick={() => setStep(1)}><ChevronLeft size={18} /> Back</button>
              <button className="btn btn-primary btn-full btn-lg"
                disabled={!form.storeName || !form.storeCategory || !form.storeEmail}
                onClick={() => setStep(3)}>
                Review Application <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div style={pg.form} className="fade-in">
            <h3 style={pg.stepTitle}>Review Your Application</h3>
            <div style={pg.review}>
              <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`} />
              <ReviewRow label="Email" value={form.email} />
              <ReviewRow label="Store Name" value={form.storeName} />
              <ReviewRow label="Category" value={form.storeCategory} />
              <ReviewRow label="Store Email" value={form.storeEmail} />
              <ReviewRow label="City" value={form.city || '—'} />
            </div>
            <div style={pg.infoBox}>
              ℹ️ Your application will be reviewed by our team within 24 hours. Once approved, you can log in and manage your store.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost btn-lg" onClick={() => setStep(2)}><ChevronLeft size={18} /> Back</button>
              <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={loading}>
                {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : '🚀 Submit Application'}
              </button>
            </div>
          </div>
        )}

        <p style={pg.foot}>Already have a store? <Link to="/login" style={pg.lnk}>Sign in</Link></p>
      </div>
    </div>
  )
}

const ReviewRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '0.875rem' }}>
    <span style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{label}</span>
    <span style={{ fontWeight: 600 }}>{value}</span>
  </div>
)

const pg = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--gray-50)' },
  card: { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '40px 36px', width: '100%', maxWidth: 560 },
  header: { textAlign: 'center', marginBottom: 28 },
  iconWrap: { width: 56, height: 56, background: '#fde8e3', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.7rem', marginBottom: 6 },
  sub: { color: 'var(--gray-500)', fontSize: '0.9rem' },
  steps: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 },
  stepItem: { display: 'flex', alignItems: 'center', gap: 8 },
  stepDot: { width: 28, height: 28, borderRadius: '50%', background: 'var(--gray-200)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 },
  stepActive: { background: 'var(--brand-primary)', color: '#fff' },
  stepDone: { background: 'var(--success)', color: '#fff' },
  stepLabel: { fontSize: '0.78rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' },
  stepLine: { width: 40, height: 2, background: 'var(--gray-200)', margin: '0 8px' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  stepTitle: { fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 },
  review: { border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '8px 16px' },
  infoBox: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.6 },
  foot: { textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--gray-600)' },
  lnk: { color: 'var(--brand-primary)', fontWeight: 600 },
}
