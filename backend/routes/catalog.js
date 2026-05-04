const express = require('express');
const router = express.Router({ mergeParams: true });
const { getTenantModels } = require('../models/getTenantModels');
const { protect, tenantAdminOnly } = require('../middleware/auth');
const { resolveTenant, validateTenantOwnership } = require('../middleware/tenant');

// ─── CATEGORIES ──────────────────────────────────────────────

// GET /api/stores/:tenantSlug/categories
router.get('/categories', resolveTenant, async (req, res) => {
  try {
    const { Category } = getTenantModels(req.schemaPrefix);
    const categories = await Category.find({ isActive: true }).sort('sortOrder name');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/stores/:tenantSlug/categories (admin)
router.post('/categories', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Category } = getTenantModels(req.schemaPrefix);
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/stores/:tenantSlug/categories/:id (admin)
router.put('/categories/:id', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Category } = getTenantModels(req.schemaPrefix);
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/stores/:tenantSlug/categories/:id (admin)
router.delete('/categories/:id', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Category } = getTenantModels(req.schemaPrefix);
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Category removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── REVIEWS ─────────────────────────────────────────────────

// GET /api/stores/:tenantSlug/reviews/:productId
router.get('/reviews/:productId', resolveTenant, async (req, res) => {
  try {
    const { Review } = getTenantModels(req.schemaPrefix);
    const reviews = await Review.find({
      productId: req.params.productId,
      isApproved: true,
    }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/stores/:tenantSlug/reviews (customer)
router.post('/reviews', protect, resolveTenant, async (req, res) => {
  try {
    const { Review, Product, Order } = getTenantModels(req.schemaPrefix);
    const { productId, orderId, rating, title, comment, images } = req.body;

    // Check if customer already reviewed
    const existing = await Review.findOne({ productId, customerId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    // Check verified purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        customerId: req.user._id,
        'items.productId': productId,
        status: 'delivered',
      });
      if (order) isVerifiedPurchase = true;
    }

    const review = await Review.create({
      productId,
      customerId: req.user._id,
      customerName: req.user.fullName,
      customerAvatar: req.user.avatar,
      orderId,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase,
    });

    // Update product rating
    const allReviews = await Review.find({ productId, isApproved: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      'stats.rating': Math.round(avgRating * 10) / 10,
      'stats.reviewCount': allReviews.length,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
