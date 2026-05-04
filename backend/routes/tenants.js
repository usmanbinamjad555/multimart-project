const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const { getTenantModels } = require('../models/getTenantModels');
const { protect, tenantAdminOnly } = require('../middleware/auth');
const { resolveTenant, validateTenantOwnership } = require('../middleware/tenant');

// @route   GET /api/tenants
// @desc    Get all active tenants (marketplace listing)
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, sort = '-stats.rating' } = req.query;
    const filter = { status: 'active', isDeleted: false };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tenants = await Tenant.find(filter)
      .select('-schemaPrefix -settings.commissionRate')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('owner', 'firstName lastName avatar');

    const total = await Tenant.countDocuments(filter);

    res.json({ success: true, data: tenants, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/tenants/categories
// @desc    Get store categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Tenant.aggregate([
      { $match: { status: 'active', isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/tenants/:tenantSlug
// @desc    Get single tenant store info + featured products
router.get('/:tenantSlug', async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      slug: req.params.tenantSlug,
      status: 'active',
      isDeleted: false,
    }).populate('owner', 'firstName lastName avatar');

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const { Product, Category } = getTenantModels(tenant.schemaPrefix);
    const featuredProducts = await Product.find({ isActive: true, isFeatured: true }).limit(8);
    const categories = await Category.find({ isActive: true }).sort('sortOrder');
    const totalProducts = await Product.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        tenant,
        featuredProducts,
        categories,
        totalProducts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/tenants/:tenantSlug/settings
// @desc    Update tenant settings (tenant admin)
router.put(
  '/:tenantSlug/settings',
  protect,
  tenantAdminOnly,
  resolveTenant,
  validateTenantOwnership,
  async (req, res) => {
    const { name, description, logo, banner, contactEmail, contactPhone, address, settings } = req.body;
    try {
      const tenant = await Tenant.findByIdAndUpdate(
        req.tenant._id,
        { name, description, logo, banner, contactEmail, contactPhone, address, settings },
        { new: true, runValidators: true }
      );
      res.json({ success: true, tenant });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
