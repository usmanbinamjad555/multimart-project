const Tenant = require('../models/Tenant');

/**
 * TENANT CONTEXT MIDDLEWARE
 * Resolves the active tenant from:
 *   1. X-Tenant-Slug header (API calls)
 *   2. tenantSlug URL parameter
 *   3. tenantId query parameter
 *
 * Attaches req.tenant and req.schemaPrefix for downstream use
 */
exports.resolveTenant = async (req, res, next) => {
  try {
    const tenantSlug =
      req.headers['x-tenant-slug'] ||
      req.params.tenantSlug ||
      req.query.tenantSlug;

    const tenantId = req.params.tenantId || req.query.tenantId;

    let tenant = null;

    if (tenantSlug) {
      tenant = await Tenant.findOne({
        slug: tenantSlug.toLowerCase(),
        isDeleted: false,
      });
    } else if (tenantId) {
      tenant = await Tenant.findOne({
        _id: tenantId,
        isDeleted: false,
      });
    }

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Store not found. Please check the store URL.',
      });
    }

    if (tenant.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This store has been suspended. Contact support.',
      });
    }

    if (tenant.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'This store is pending approval.',
      });
    }

    // Attach to request for all downstream handlers
    req.tenant = tenant;
    req.schemaPrefix = tenant.schemaPrefix;

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Tenant resolution failed.', error: err.message });
  }
};

/**
 * Optional tenant middleware - doesn't fail if no tenant found
 * Used for routes that can work with or without tenant context
 */
exports.optionalTenant = async (req, res, next) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] || req.params.tenantSlug;

    if (!tenantSlug) return next();

    const tenant = await Tenant.findOne({
      slug: tenantSlug.toLowerCase(),
      isDeleted: false,
      status: 'active',
    });

    if (tenant) {
      req.tenant = tenant;
      req.schemaPrefix = tenant.schemaPrefix;
    }

    next();
  } catch {
    next();
  }
};

/**
 * Validate tenant admin owns the requested tenant
 */
exports.validateTenantOwnership = (req, res, next) => {
  if (req.user.role === 'superadmin') return next();

  const userTenantId = req.user.tenantId?._id?.toString() || req.user.tenantId?.toString();
  const requestedTenantId = req.tenant?._id?.toString();

  if (!userTenantId || userTenantId !== requestedTenantId) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to manage this store.',
    });
  }
  next();
};
