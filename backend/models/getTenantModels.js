const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

/**
 * ============================================================
 * MULTI-TENANT SCHEMA ISOLATION — CORE CONCEPT
 * ============================================================
 *
 * STRATEGY: Shared Database + Separate Collections (per Tenant)
 *
 * All tenants share ONE MongoDB database ("multimart").
 * Each tenant gets their OWN set of collections, prefixed by
 * their unique schemaPrefix (e.g., "techstore_abc123"):
 *
 *   techstore_abc123_products
 *   techstore_abc123_categories
 *   techstore_abc123_orders
 *   techstore_abc123_order_items
 *   techstore_abc123_reviews
 *   techstore_abc123_inventory
 *
 * This guarantees:
 *   ✅ Complete data isolation between tenants
 *   ✅ Tenant can have their own indexes & schema variations
 *   ✅ Easier per-tenant backup & restore
 *   ✅ No cross-tenant data leaks
 *   ✅ Scales well for moderate number of tenants
 *
 * Model cache prevents re-compiling schemas on every request.
 * ============================================================
 */

const modelCache = new Map();

// ─── PRODUCT SCHEMA ─────────────────────────────────────────
const buildProductSchema = () => {
  const schema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: 200,
      },
      slug: { type: String, lowercase: true },
      description: { type: String, required: true },
      shortDescription: { type: String, maxlength: 300 },
      sku: { type: String, unique: true, sparse: true },
      price: { type: Number, required: true, min: 0 },
      compareAtPrice: { type: Number, default: null }, // original/MRP price
      costPrice: { type: Number, default: 0 },
      categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
      categoryName: { type: String },
      images: [
        {
          url: { type: String, required: true },
          alt: String,
          isPrimary: { type: Boolean, default: false },
        },
      ],
      variants: [
        {
          name: String, // e.g., "Color", "Size"
          options: [
            {
              label: String, // e.g., "Red", "XL"
              priceAdjustment: { type: Number, default: 0 },
              stock: { type: Number, default: 0 },
              sku: String,
            },
          ],
        },
      ],
      tags: [String],
      stock: { type: Number, default: 0, min: 0 },
      lowStockThreshold: { type: Number, default: 5 },
      weight: { type: Number, default: 0 }, // in grams
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      isActive: { type: Boolean, default: true },
      isFeatured: { type: Boolean, default: false },
      isService: { type: Boolean, default: false }, // services vs physical products
      serviceDetails: {
        duration: String,
        deliveryTime: String,
        serviceArea: [String],
      },
      seoTitle: String,
      seoDescription: String,
      stats: {
        views: { type: Number, default: 0 },
        purchases: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
      },
      discount: {
        type: { type: String, enum: ['percentage', 'fixed'], default: null },
        value: { type: Number, default: 0 },
        expiresAt: Date,
      },
    },
    { timestamps: true }
  );

  schema.plugin(mongoosePaginate);

  // Auto-generate slug
  schema.pre('save', function (next) {
    if (this.isModified('name') || this.isNew) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    next();
  });

  // Virtual: effective (discounted) price
  schema.virtual('effectivePrice').get(function () {
    if (!this.discount || !this.discount.type) return this.price;
    if (this.discount.expiresAt && new Date() > this.discount.expiresAt) return this.price;
    if (this.discount.type === 'percentage') {
      return Math.round(this.price * (1 - this.discount.value / 100));
    }
    return Math.max(0, this.price - this.discount.value);
  });

  schema.set('toJSON', { virtuals: true });
  return schema;
};

// ─── CATEGORY SCHEMA ────────────────────────────────────────
const buildCategorySchema = () => {
  const schema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      slug: { type: String, lowercase: true },
      description: String,
      image: String,
      parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
      isActive: { type: Boolean, default: true },
      sortOrder: { type: Number, default: 0 },
      productCount: { type: Number, default: 0 },
    },
    { timestamps: true }
  );

  schema.pre('save', function (next) {
    if (this.isModified('name') || this.isNew) {
      this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    next();
  });

  return schema;
};

// ─── ORDER SCHEMA ────────────────────────────────────────────
const buildOrderSchema = () => {
  const schema = new mongoose.Schema(
    {
      orderNumber: { type: String, unique: true },
      customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
      customerEmail: String,
      customerName: String,
      customerPhone: String,
      items: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, required: true },
          productName: String,
          productImage: String,
          sku: String,
          quantity: { type: Number, required: true, min: 1 },
          unitPrice: { type: Number, required: true },
          totalPrice: { type: Number, required: true },
          variant: {
            name: String,
            option: String,
          },
        },
      ],
      shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: String,
        country: { type: String, default: 'Pakistan' },
        zipCode: String,
      },
      billing: {
        subtotal: { type: Number, required: true },
        shippingCost: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
      payment: {
        method: {
          type: String,
          enum: ['cod', 'card', 'easypaisa', 'jazzcash', 'bank_transfer'],
          default: 'cod',
        },
        status: {
          type: String,
          enum: ['pending', 'paid', 'failed', 'refunded'],
          default: 'pending',
        },
        transactionId: String,
        paidAt: Date,
      },
      status: {
        type: String,
        enum: [
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'out_for_delivery',
          'delivered',
          'cancelled',
          'refunded',
          'returned',
        ],
        default: 'pending',
      },
      statusHistory: [
        {
          status: String,
          note: String,
          updatedAt: { type: Date, default: Date.now },
          updatedBy: mongoose.Schema.Types.ObjectId,
        },
      ],
      notes: String,
      estimatedDelivery: Date,
      deliveredAt: Date,
      couponCode: String,
      isReviewed: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  schema.plugin(mongoosePaginate);

  // Auto-generate order number
  schema.pre('save', function (next) {
    if (this.isNew) {
      const ts = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
      this.orderNumber = `ORD-${ts}-${rand}`;
    }
    next();
  });

  return schema;
};

// ─── REVIEW SCHEMA ───────────────────────────────────────────
const buildReviewSchema = () => {
  const schema = new mongoose.Schema(
    {
      productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
      customerName: String,
      customerAvatar: String,
      orderId: mongoose.Schema.Types.ObjectId,
      rating: { type: Number, required: true, min: 1, max: 5 },
      title: { type: String, maxlength: 100 },
      comment: { type: String, maxlength: 1000 },
      images: [String],
      isVerifiedPurchase: { type: Boolean, default: false },
      isApproved: { type: Boolean, default: true },
      helpfulVotes: { type: Number, default: 0 },
      tenantResponse: {
        comment: String,
        respondedAt: Date,
      },
    },
    { timestamps: true }
  );

  return schema;
};

// ─── COUPON SCHEMA ───────────────────────────────────────────
const buildCouponSchema = () => {
  const schema = new mongoose.Schema(
    {
      code: { type: String, required: true, uppercase: true, unique: true },
      description: String,
      discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
      discountValue: { type: Number, required: true },
      minOrderAmount: { type: Number, default: 0 },
      maxDiscountAmount: { type: Number, default: null },
      usageLimit: { type: Number, default: null },
      usageCount: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
      expiresAt: { type: Date, required: true },
      applicableProducts: [mongoose.Schema.Types.ObjectId],
      applicableCategories: [mongoose.Schema.Types.ObjectId],
    },
    { timestamps: true }
  );
  return schema;
};

// ─── TENANT MODELS FACTORY ───────────────────────────────────
/**
 * Returns mongoose models scoped to a specific tenant.
 * Models use tenant-prefixed collection names for isolation.
 * Results are cached to avoid re-compilation.
 */
const getTenantModels = (schemaPrefix) => {
  if (!schemaPrefix) throw new Error('Schema prefix is required for tenant model isolation');

  const cacheKey = schemaPrefix;

  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey);
  }

  // Create models with tenant-specific collection names
  const models = {
    Product: getOrCreateModel(
      `${schemaPrefix}_Product`,
      buildProductSchema(),
      `${schemaPrefix}_products`
    ),
    Category: getOrCreateModel(
      `${schemaPrefix}_Category`,
      buildCategorySchema(),
      `${schemaPrefix}_categories`
    ),
    Order: getOrCreateModel(
      `${schemaPrefix}_Order`,
      buildOrderSchema(),
      `${schemaPrefix}_orders`
    ),
    Review: getOrCreateModel(
      `${schemaPrefix}_Review`,
      buildReviewSchema(),
      `${schemaPrefix}_reviews`
    ),
    Coupon: getOrCreateModel(
      `${schemaPrefix}_Coupon`,
      buildCouponSchema(),
      `${schemaPrefix}_coupons`
    ),
  };

  modelCache.set(cacheKey, models);
  return models;
};

// Helper: get existing model or create new one
const getOrCreateModel = (modelName, schema, collectionName) => {
  try {
    return mongoose.model(modelName);
  } catch {
    return mongoose.model(modelName, schema, collectionName);
  }
};

module.exports = { getTenantModels };
