const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes    = require('./routes/auth');
const adminRoutes   = require('./routes/admin');
const tenantRoutes  = require('./routes/tenants');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const catalogRoutes = require('./routes/catalog');
const searchRoutes  = require('./routes/search');
const uploadRoutes  = require('./routes/upload');

const app = express();
connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded images as static files ──────────────────────
// e.g., GET http://localhost:5000/uploads/products/1234-abc.jpg
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next(); });
}

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/search',  searchRoutes);
app.use('/api/upload',  uploadRoutes);

app.use('/api/stores/:tenantSlug/products', productRoutes);
app.use('/api/stores/:tenantSlug/orders',   orderRoutes);
app.use('/api/stores/:tenantSlug',          catalogRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MultiMart API running',
    version: '1.0.0',
    imageUpload: 'POST /api/upload  (field: "image", max 5MB)',
    architecture: 'Shared DB + Separate Schema (Collections per Tenant)',
  });
});

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`\n🚀 MultiMart running on port ${PORT}`);
  console.log(`📁 Static uploads: http://localhost:${PORT}/uploads/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
