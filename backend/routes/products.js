const express = require('express');
const router = express.Router({ mergeParams: true });
const { getTenantModels } = require('../models/getTenantModels');
const Tenant = require('../models/Tenant');
const { protect, tenantAdminOnly } = require('../middleware/auth');
const { resolveTenant, validateTenantOwnership } = require('../middleware/tenant');

// ─── PUBLIC ROUTES ───────────────────────────────────────────

// @route   GET /api/stores/:tenantSlug/products
// @desc    Get tenant products (public)
router.get('/', resolveTenant, async (req, res) => {
  try {
    const { Product } = getTenantModels(req.schemaPrefix);
    const {
      page = 1, limit = 20, category, search, sort = '-createdAt',
      minPrice, maxPrice, featured, inStock, isService,
    } = req.query;

    const filter = { isActive: true };
    if (category) filter.categoryId = category;
    if (featured === 'true') filter.isFeatured = true;
    if (isService !== undefined) filter.isService = isService === 'true';
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
    };

    const result = await Product.paginate(filter, options);

    res.json({
      success: true,
      data: result.docs,
      total: result.totalDocs,
      page: result.page,
      pages: result.totalPages,
      tenant: { id: req.tenant._id, name: req.tenant.name, slug: req.tenant.slug },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/stores/:tenantSlug/products/:productId
// @desc    Get single product
router.get('/:productId', resolveTenant, async (req, res) => {
  try {
    const { Product, Review, Category } = getTenantModels(req.schemaPrefix);

    const product = await Product.findOne({ _id: req.params.productId, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Increment views
    await Product.findByIdAndUpdate(req.params.productId, { $inc: { 'stats.views': 1 } });

    const reviews = await Review.find({ productId: product._id, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(10);

    const category = product.categoryId ? await Category.findById(product.categoryId) : null;

    const relatedProducts = await Product.find({
      categoryId: product.categoryId,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(6);

    res.json({
      success: true,
      data: { product, reviews, category, relatedProducts },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── TENANT ADMIN ROUTES ─────────────────────────────────────

// @route   POST /api/stores/:tenantSlug/products
// @desc    Create product (tenant admin)
router.post('/', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Product, Category } = getTenantModels(req.schemaPrefix);
    const productData = req.body;

    // Resolve category name
    if (productData.categoryId) {
      const cat = await Category.findById(productData.categoryId);
      if (cat) {
        productData.categoryName = cat.name;
        await Category.findByIdAndUpdate(productData.categoryId, { $inc: { productCount: 1 } });
      }
    }

    const product = await Product.create(productData);

    // Update tenant stats
    await Tenant.findByIdAndUpdate(req.tenant._id, { $inc: { 'stats.totalProducts': 1 } });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/stores/:tenantSlug/products/:productId
// @desc    Update product
router.put('/:productId', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Product } = getTenantModels(req.schemaPrefix);
    const product = await Product.findByIdAndUpdate(req.params.productId, req.body, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/stores/:tenantSlug/products/:productId
// @desc    Soft-delete product
router.delete('/:productId', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Product } = getTenantModels(req.schemaPrefix);
    await Product.findByIdAndUpdate(req.params.productId, { isActive: false });
    await Tenant.findByIdAndUpdate(req.tenant._id, { $inc: { 'stats.totalProducts': -1 } });
    res.json({ success: true, message: 'Product removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/stores/:tenantSlug/products/admin/all
// @desc    Get ALL products for tenant admin (including inactive)
router.get('/admin/all', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Product } = getTenantModels(req.schemaPrefix);
    const { page = 1, limit = 20, search, isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };

    const result = await Product.paginate(filter, {
      page: parseInt(page), limit: parseInt(limit), sort: '-createdAt',
    });

    res.json({ success: true, data: result.docs, total: result.totalDocs, pages: result.totalPages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
