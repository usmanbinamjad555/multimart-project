# MultiMart — Multi-Tenant E-Commerce Platform

> A production-grade multi-tenant marketplace built with the MERN stack.  
> Inspired by Daraz, supporting multiple vendors/service providers under one platform.

End-to-end Selenium tests for this app live in [multimart-tests](https://github.com/usmanbinamjad555/multimart-tests).

---
 
## Multi-Tenancy Architecture

### Strategy: **Shared Database + Separate Schema (Collections)** 
 
``` 
MongoDB Database: "multimart"
│
├── SHARED COLLECTIONS (Global) 
│   ├── users           → All users (superadmin, tenant_admins, customers) 
│   └── tenants         → All store registrations & metadata 
│
└── PER-TENANT COLLECTIONS (Isolated) 
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

| Feature | Shared DB + Shared Schema | **Shared DB + Separate Schema** (chosen) | Separate DB |
|---------|--------------------------|-------------------------------------|-------------|
| Data Isolation | Risk of leaks | Full isolation | Full isolation |
| Performance | Queries get slower | Per-tenant indexes | Best |
| Cost | Very cheap | Cheap | Expensive |
| Backup per tenant | Hard | Easy | Easy |
| Scale | Limited | Moderate | Best |
 
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

## Project Structure

```
multimart/
├── docker-compose.yml               # MongoDB + backend + frontend containers
├── Jenkinsfile                      # CI/CD: deploy with Docker Compose, then run Selenium tests
├── .env.example                     # Variables for docker compose
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT + role authorization
│   │   └── tenant.js                # Tenant resolution + ownership validation
│   ├── models/
│   │   ├── User.js                  # Global user model (shared collection)
│   │   ├── Tenant.js                # Global tenant model (shared collection)
│   │   └── getTenantModels.js       # Core isolation: per-tenant model factory
│   ├── routes/
│   │   ├── auth.js                  # Register, login, profile
│   │   ├── admin.js                 # Super admin endpoints
│   │   ├── tenants.js               # Public store browsing
│   │   ├── products.js              # Tenant-scoped products
│   │   ├── orders.js                # Tenant-scoped orders
│   │   ├── catalog.js               # Categories + reviews
│   │   ├── search.js                # Global cross-tenant search
│   │   └── upload.js                # Image upload
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

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: MONGO_URI, JWT_SECRET, SUPER_ADMIN_PASSWORD, ...
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

> Note: the Vite dev-server proxy in `frontend/vite.config.js` forwards `/api` to `http://backend-api:8081` (the Docker container name). For a fully local run, point it at `http://localhost:8081`.

### Run with Docker Compose
```bash
cp .env.example .env
# Set JWT_SECRET and SUPER_ADMIN_PASSWORD (compose refuses to start without them)
docker compose up -d --build
docker exec backend-api node utils/seeder.js
```

Services: MongoDB (`27017`), backend API (`8081`), frontend (`5173`).

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string (required) |
| `JWT_SECRET` | Secret used to sign JWTs (required, no default) |
| `JWT_EXPIRE` | Token lifetime, e.g. `30d` |
| `PORT` | Backend port (default `8081`) |
| `CLIENT_URL` | Allowed CORS origin (default `http://localhost:5173`) |
| `SUPER_ADMIN_EMAIL` | Super admin account created by the seeder |
| `SUPER_ADMIN_PASSWORD` | Super admin password used by the seeder (required, no default) |

The backend exits on startup if `MONGO_URI` or `JWT_SECRET` is missing.

---

## Demo Credentials (Local Seed Data Only)

These accounts are created by `backend/utils/seeder.js` for **local development only**. Do not use them on a public deployment.

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | value of `SUPER_ADMIN_EMAIL` (default admin@multimart.com) | value of `SUPER_ADMIN_PASSWORD` |
| **TechZone Admin** | ali@techzone.pk | password123 |
| **FashionHub Admin** | fatima@fashionhub.pk | password123 |
| **SwiftServices Admin** | usman@swiftservices.pk | password123 |
| **Customer** | ahmed@example.com | password123 |

---

## API Endpoints

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

## User Roles

### Super Admin
- Approve / reject / suspend tenant stores
- Manage all users
- Platform-wide analytics dashboard

### Tenant Admin
- Manage products, categories, orders
- View store-specific analytics
- Update store settings

### Customer
- Browse stores and products
- Global search across all stores
- Shopping cart (multi-tenant)
- Place and track orders
- Write reviews

---

## Tech Stack

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
| Uploads | multer |
| DevOps | Docker Compose, Jenkins |
| E2E Tests | Selenium + TestNG ([multimart-tests](https://github.com/usmanbinamjad555/multimart-tests)) |

---

## Key Multi-Tenant Concepts

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
  → Zero data leakage from other tenants
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

---

## CI/CD

The `Jenkinsfile` runs on every push:

1. **Checkout & Deploy** — tears down the previous stack, rebuilds and starts it with `docker compose -p multimart`, waits for MongoDB to report healthy, then reseeds the database.
2. **Execute Selenium Tests** — inside `markhobson/maven-chrome:jdk-17`, clones [multimart-tests](https://github.com/usmanbinamjad555/multimart-tests) and runs `mvn clean test -Dtest=MultiMartTest`; JUnit reports are published.
3. **Post** — emails an HTML build summary with the console log to the committer.

Required Jenkins configuration:

| Name | Type | Purpose |
|------|------|---------|
| `multimart-jwt-secret` | Credential (Secret text) | Exported as `JWT_SECRET` |
| `multimart-super-admin-password` | Credential (Secret text) | Exported as `SUPER_ADMIN_PASSWORD` |
| `EC2_HOST` | Environment variable | Public host used for the deployment link in the email (defaults to `localhost`) |

---

Author: Muhammad Usman — [LinkedIn](https://www.linkedin.com/in/muhammad-usman-the-dev) · [Portfolio](https://muhammad-usman-engineer.vercel.app)
