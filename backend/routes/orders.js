const express = require('express');
const router = express.Router({ mergeParams: true });
const { getTenantModels } = require('../models/getTenantModels');
const Tenant = require('../models/Tenant');
const { protect, tenantAdminOnly } = require('../middleware/auth');
const { resolveTenant, validateTenantOwnership } = require('../middleware/tenant');

// @route   POST /api/stores/:tenantSlug/orders
// @desc    Place order (customer)
router.post('/', protect, resolveTenant, async (req, res) => {
  try {
    const { Product, Order } = getTenantModels(req.schemaPrefix);
    const { items, shippingAddress, payment, notes, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
    }

    // Validate products & calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, isActive: true });
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      if (!product.isService && product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${product.name}. Available: ${product.stock}`,
        });
      }

      const unitPrice = product.effectivePrice || product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.images?.[0]?.url || null,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        variant: item.variant,
      });

      // Deduct stock
      if (!product.isService) {
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -item.quantity, 'stats.purchases': item.quantity },
        });
      }
    }

    const shippingCost = subtotal > 2000 ? 0 : 200; // Free shipping over PKR 2000
    const total = subtotal + shippingCost;

    const order = await Order.create({
      customerId: req.user._id,
      customerEmail: req.user.email,
      customerName: req.user.fullName,
      customerPhone: req.user.phone,
      items: processedItems,
      shippingAddress,
      billing: { subtotal, shippingCost, total },
      payment: { method: payment?.method || 'cod' },
      notes,
      couponCode,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // Update tenant stats
    await Tenant.findByIdAndUpdate(req.tenant._id, {
      $inc: { 'stats.totalOrders': 1, 'stats.totalRevenue': total },
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/stores/:tenantSlug/orders/my
// @desc    Get customer's own orders for this store
router.get('/my', protect, resolveTenant, async (req, res) => {
  try {
    const { Order } = getTenantModels(req.schemaPrefix);
    const { page = 1, limit = 10 } = req.query;

    const result = await Order.paginate(
      { customerId: req.user._id },
      { page: parseInt(page), limit: parseInt(limit), sort: '-createdAt' }
    );

    res.json({ success: true, data: result.docs, total: result.totalDocs, pages: result.totalPages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/stores/:tenantSlug/orders/:orderId
// @desc    Get single order
router.get('/:orderId', protect, resolveTenant, async (req, res) => {
  try {
    const { Order } = getTenantModels(req.schemaPrefix);
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Customer can only see their own orders
    if (
      req.user.role === 'customer' &&
      order.customerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── TENANT ADMIN ORDER MANAGEMENT ──────────────────────────

// @route   GET /api/stores/:tenantSlug/orders
// @desc    Get all orders (tenant admin)
router.get('/', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Order } = getTenantModels(req.schemaPrefix);
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { customerEmail: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
    ];

    const result = await Order.paginate(filter, {
      page: parseInt(page), limit: parseInt(limit), sort: '-createdAt',
    });

    res.json({ success: true, data: result.docs, total: result.totalDocs, pages: result.totalPages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/stores/:tenantSlug/orders/:orderId/status
// @desc    Update order status (tenant admin)
router.put('/:orderId/status', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Order } = getTenantModels(req.schemaPrefix);
    const { status, note } = req.body;

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['out_for_delivery'],
      out_for_delivery: ['delivered', 'returned'],
      delivered: ['refunded', 'returned'],
    };

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${order.status}' to '${status}'.`,
      });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || '', updatedBy: req.user._id });
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/stores/:tenantSlug/orders/analytics/summary
// @desc    Order analytics for tenant dashboard
router.get('/analytics/summary', protect, tenantAdminOnly, resolveTenant, validateTenantOwnership, async (req, res) => {
  try {
    const { Order } = getTenantModels(req.schemaPrefix);

    const [totalOrders, pendingOrders, deliveredOrders, revenueData] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'confirmed', 'processing', 'shipped'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$billing.total' }, avgOrder: { $avg: '$billing.total' } } },
      ]),
    ]);

    const last7Days = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$billing.total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        avgOrderValue: revenueData[0]?.avgOrder || 0,
        last7Days,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
