const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const { protect } = require('../middleware/auth');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      tenantId: user.tenantId,
      phone: user.phone,
    },
  });
};

// @route   POST /api/auth/register
// @desc    Register customer
// @access  Public
router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        role: 'customer',
      });

      sendTokenResponse(user, 201, res);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// @route   POST /api/auth/register-tenant
// @desc    Register tenant admin + create tenant store
// @access  Public
router.post(
  '/register-tenant',
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('storeName').trim().notEmpty().withMessage('Store name required'),
    body('storeCategory').notEmpty().withMessage('Store category required'),
    body('storeEmail').isEmail().withMessage('Valid store email required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      firstName, lastName, email, password, phone,
      storeName, storeDescription, storeCategory,
      storeEmail, storePhone, address,
    } = req.body;

    try {
      // Check user uniqueness
      if (await User.findOne({ email })) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }

      // Create user with tenant_admin role (no tenantId yet)
      const user = await User.create({
        firstName, lastName, email, password, phone,
        role: 'tenant_admin',
      });

      // Create tenant store
      const tenant = await Tenant.create({
        name: storeName,
        description: storeDescription,
        category: storeCategory,
        contactEmail: storeEmail,
        contactPhone: storePhone,
        address,
        owner: user._id,
        status: 'pending', // Requires super admin approval
      });

      // Link user to tenant
      user.tenantId = tenant._id;
      await user.save({ validateBeforeSave: false });

      res.status(201).json({
        success: true,
        message: 'Store registration submitted! Awaiting admin approval.',
        tenant: { id: tenant._id, name: tenant.name, status: tenant.status },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email })
        .select('+password')
        .populate('tenantId', 'name slug schemaPrefix status');

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Account deactivated.' });
      }

      sendTokenResponse(user, 200, res);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('tenantId', 'name slug schemaPrefix status settings stats');
  res.json({ success: true, user });
});

// @route   PUT /api/auth/profile
// @desc    Update profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { firstName, lastName, phone, avatar, addresses } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, avatar, addresses },
      { new: true, runValidators: true }
    ).populate('tenantId', 'name slug');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
