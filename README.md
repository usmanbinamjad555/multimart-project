# 🛒 MultiMart — Multi-Tenant E-Commerce Platform

> A production-grade multi-tenant marketplace built with the MERN stack.  
> Inspired by Daraz, supporting multiple vendors/service providers under one platform.

---

## 🏗️ Multi-Tenancy Architecture

### Strategy: **Shared Database + Separate Schema (Collections)**

```
MongoDB Database: "multimart"
│
├── 🌐 SHARED COLLECTIONS (Global)
│   ├── users           → All users (superadmin, tenant_admins, customers)
│   └── tenants         → All store registrations & metadata
│
└── 🏪 PER-TENANT COLLECTIONS (Isolated)
    ├── techzone_abc123_products
    ├── techzone_abc123_orders
    ├── techzone_abc123_categories
    ├── techzone_abc123_reviews
    ├── techzone_abc123_coupons
    │
    ├── fashionhub_def456_products
    ├── fashionhub_def456_orders
    ├── fashionhub_def456_categories
    └── ... (per tenant)
```

### Why This Approach?

| Feature | Shared DB + Shared Schema | **Shared DB + Separate Schema** ✅ | Separate DB |
|---------|--------------------------|-------------------------------------|-------------|
| Data Isolation | ❌ Risk of leaks | ✅ Full isolation | ✅ Full isolation |
| Performance | ⚠️ Queries get slower | ✅ Per-tenant indexes | ✅ Best |
| Cost | ✅ Very cheap | ✅ Cheap | ❌ Expensive |
| Backup per tenant | ❌ Hard | ✅ Easy | ✅ Easy |
| Scale | ❌ Limited | ✅ Moderate | ✅ Best |

### How It Works in Code

Each tenant gets a unique `schemaPrefix` (e.g., `techzone_abc123`).  
When a request comes in, the `resolveTenant` middleware finds the tenant and sets `req.schemaPrefix`.  
`getTenantModels(schemaPrefix)` then returns **Mongoose models bound to that tenant's collections**.

```javascript
// middleware/tenant.js
const tenant = await Tenant.findOne({ slug: tenantSlug });
req.tenant = tenant;
req.schemaPrefix = tenant.schemaPrefix; // e.g., "techzone_abc123"

// models/getTenantModels.js
const getTenantModels = (schemaPrefix) => {
  return {
    Product: mongoose.model(`${schemaPrefix}_Product`, productSchema, `${schemaPrefix}_products`),
    Order:   mongoose.model(`${schemaPrefix}_Order`,   orderSchema,   `${schemaPrefix}_orders`),
    // ...
  };
};

// routes/products.js — no cross-tenant leaks possible
const { Product } = getTenantModels(req.schemaPrefix);
const products = await Product.find({ isActive: true }); // Only THIS tenant's products
```

---

## 📁 Project Structure

```
multimart/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT + role authorization
│   │   └── tenant.js                # Tenant resolution + ownership validation
│   ├── models/
│   │   ├── User.js                  # Global user model (shared collection)
│   │   ├── Tenant.js                # Global tenant model (shared collection)
│   │   └── getTenantModels.js       # ⭐ Core isolation: per-tenant model factory
│   ├── routes/
│   │   ├── auth.js                  # Register, login, profile
│   │   ├── admin.js                 # Super admin endpoints
│   │   ├── tenants.js               # Public store browsing
│   │   ├── products.js              # Tenant-scoped products
│   │   ├── orders.js                # Tenant-scoped orders
│   │   ├── catalog.js               # Categories + reviews
│   │   └── search.js                # Global cross-tenant search
│   ├── utils/
│   │   └── seeder.js                # Seed demo data
│   ├── server.js                    # Express app entry
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx       # JWT auth state
    │   │   └── CartContext.jsx       # Shopping cart state
    │   ├── services/
    │   │   └── api.js               # Axios API client
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Footer.jsx
    │   │   └── common/
    │   │       ├── ProductCard.jsx
    │   │       └── TenantCard.jsx
    │   ├── pages/
    │   │   ├── Home.jsx              # Marketplace homepage
    │   │   ├── Login.jsx             # Unified login (all roles)
    │   │   ├── Register.jsx          # Customer registration
    │   │   ├── RegisterStore.jsx     # 2-step store registration
    │   │   ├── Stores.jsx            # Browse all stores
    │   │   ├── StoreFront.jsx        # Individual store page
    │   │   ├── ProductDetail.jsx     # Product page
    │   │   ├── Cart.jsx              # Shopping cart
    │   │   ├── Checkout.jsx          # Order placement
    │   │   ├── SearchResults.jsx     # Global search
    │   │   ├── superadmin/
    │   │   │   ├── AdminLayout.jsx   # Admin sidebar layout
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminTenants.jsx
    │   │   │   └── AdminUsers.jsx
    │   │   └── tenant/
    │   │       ├── TenantLayout.jsx  # Tenant sidebar layout
    │   │       ├── TenantDashboard.jsx
    │   │       ├── TenantProducts.jsx
    │   │       ├── TenantOrders.jsx
    │   │       └── TenantCategories.jsx
    │   ├── App.jsx                   # Routes + providers
    │   └── index.css                 # Design system
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### 2. Seed Demo Data
```bash
cd backend
node utils/seeder.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | admin@multimart.com | Admin@12345 |
| **TechZone Admin** | ali@techzone.pk | password123 |
| **FashionHub Admin** | fatima@fashionhub.pk | password123 |
| **SwiftServices Admin** | usman@swiftservices.pk | password123 |
| **Customer** | ahmed@example.com | password123 |

---

## 🛣️ API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/register-tenant` | Public |
| GET | `/api/auth/me` | Protected |

### Super Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/dashboard` | Super Admin |
| GET | `/api/admin/tenants` | Super Admin |
| PUT | `/api/admin/tenants/:id/status` | Super Admin |
| GET | `/api/admin/users` | Super Admin |

### Stores (Public)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tenants` | Public |
| GET | `/api/tenants/:slug` | Public |
| GET | `/api/search?q=...` | Public |

### Tenant-Scoped (Schema Isolated)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/stores/:slug/products` | Public |
| POST | `/api/stores/:slug/products` | Tenant Admin |
| GET | `/api/stores/:slug/orders` | Tenant Admin |
| PUT | `/api/stores/:slug/orders/:id/status` | Tenant Admin |
| POST | `/api/stores/:slug/orders` | Customer |
| GET | `/api/stores/:slug/categories` | Public |

---

## 👥 User Roles

### 🔴 Super Admin
- Approve / reject / suspend tenant stores
- Manage all users
- Platform-wide analytics dashboard

### 🟠 Tenant Admin
- Manage products, categories, orders
- View store-specific analytics
- Update store settings

### 🔵 Customer
- Browse stores and products
- Global search across all stores
- Shopping cart (multi-tenant)
- Place and track orders
- Write reviews

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| State | Context API |
| HTTP | Axios |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |
| Validation | express-validator |
| Pagination | mongoose-paginate-v2 |

---

## 🔑 Key Multi-Tenant Concepts

### Tenant Registration Flow
```
User fills store form → POST /api/auth/register-tenant
  → User created (role: tenant_admin)
  → Tenant created (status: pending)
  → User.tenantId linked
  → Super admin reviews → approves → status: active
  → Tenant admin can now login and manage store
```

### Request Flow (Tenant-Scoped)
```
GET /api/stores/techzone/products
  → resolveTenant middleware: finds Tenant{slug:"techzone"}
  → req.schemaPrefix = "techzone_abc123"
  → getTenantModels("techzone_abc123") → {Product, Order, ...}
  → Product.find() queries "techzone_abc123_products" collection
  → ✅ Zero data leakage from other tenants
```

### Collection Isolation Proof
```
db.getCollectionNames().filter(n => n.includes('products'))
// Output:
[
  "techzone_abc123_products",
  "fashionhub_def456_products", 
  "swiftservices_ghi789_products"
]
// Each completely separate — no cross-tenant queries possible
```
