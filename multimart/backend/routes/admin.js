const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { getTenantModels } = require('../models/getTenantModels');
const { protect, superAdminOnly } = require('../middleware/auth');

// All routes require super admin
router.use(protect, superAdminOnly);

// @route   GET /api/admin/dashboard
// @desc    Super admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [totalTenants, activeTenants, pendingTenants, totalCustomers] = await Promise.all([
      Tenant.countDocuments({ isDeleted: false }),
      Tenant.countDocuments({ status: 'active', isDeleted: false }),
      Tenant.countDocuments({ status: 'pending', isDeleted: false }),
      User.countDocuments({ role: 'customer', isActive: true }),
    ]);

    const recentTenants = await Tenant.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'firstName lastName email');

    const categoryStats = await Tenant.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalTenants, activeTenants, pendingTenants, totalCustomers },
        recentTenants,
        categoryStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/tenants
// @desc    Get all tenants
router.get('/tenants', async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const tenants = await Tenant.find(filter)
      .populate('owner', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Tenant.countDocuments(filter);

    res.json({ success: true, data: tenants, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/tenants/:id/status
// @desc    Approve / suspend / reject a tenant
router.put('/tenants/:id/status', async (req, res) => {
  const { status, reason } = req.body;
  const validStatuses = ['active', 'suspended', 'rejected', 'pending'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('owner', 'firstName lastName email');

    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });

    res.json({ success: true, message: `Store ${status} successfully.`, tenant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .populate('tenantId', 'name slug status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({ success: true, data: users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/users/:id/toggle
// @desc    Activate / deactivate user
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot deactivate super admin.' });
    }
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/tenants/:id
// @desc    Soft-delete tenant
router.delete('/tenants/:id', async (req, res) => {
  try {
    await Tenant.findByIdAndUpdate(req.params.id, { isDeleted: true, status: 'suspended' });
    res.json({ success: true, message: 'Store deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
