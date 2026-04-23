const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * GLOBAL TENANT MODEL
 * Stored in shared 'tenants' collection
 * Each tenant gets their OWN schema/collections prefixed by tenantSlug
 */
const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    logo: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: [
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Sports',
        'Books',
        'Food & Grocery',
        'Health & Beauty',
        'Automotive',
        'Services',
        'Other',
      ],
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'Pakistan' },
      zipCode: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'rejected'],
      default: 'pending',
    },
    settings: {
      currency: { type: String, default: 'PKR' },
      theme: { type: String, default: 'default' },
      commissionRate: { type: Number, default: 5 }, // % platform takes
      allowReviews: { type: Boolean, default: true },
    },
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
    },
    /**
     * SCHEMA ISOLATION KEY:
     * All tenant-specific collections are prefixed with this schema prefix.
     * e.g., schemaPrefix = "tech_store_abc" means:
     *   - Products → collection: "tech_store_abc_products"
     *   - Orders   → collection: "tech_store_abc_orders"
     *   - Categories → collection: "tech_store_abc_categories"
     *   - Reviews  → collection: "tech_store_abc_reviews"
     */
    schemaPrefix: {
      type: String,
      unique: true,
      lowercase: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug and schemaPrefix from name before saving
tenantSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    const base = slugify(this.name, { lower: true, strict: true });
    this.slug = base;
    // schemaPrefix uses the MongoDB _id to guarantee uniqueness in collection names
    if (!this.schemaPrefix) {
      this.schemaPrefix = base + '_' + this._id.toString().slice(-6);
    }
  }
  next();
});

// Virtual: tenant store URL
tenantSchema.virtual('storeUrl').get(function () {
  return `/store/${this.slug}`;
});

module.exports = mongoose.model('Tenant', tenantSchema);
