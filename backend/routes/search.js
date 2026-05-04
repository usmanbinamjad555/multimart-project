const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const { getTenantModels } = require('../models/getTenantModels');

// @route   GET /api/search?q=...&category=...
// @desc    Global search across all active tenants
router.get('/', async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20, minPrice, maxPrice } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    }

    // Get all active tenants
    const tenantFilter = { status: 'active', isDeleted: false };
    if (category) tenantFilter.category = category;

    const tenants = await Tenant.find(tenantFilter).select('name slug schemaPrefix logo settings.currency');

    const productFilter = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ],
    };
    if (minPrice) productFilter.price = { $gte: parseFloat(minPrice) };
    if (maxPrice) {
      productFilter.price = productFilter.price || {};
      productFilter.price.$lte = parseFloat(maxPrice);
    }

    const allResults = [];

    // Search across each tenant's product collection
    for (const tenant of tenants) {
      try {
        const { Product } = getTenantModels(tenant.schemaPrefix);
        const products = await Product.find(productFilter).limit(10).lean();

        products.forEach((product) => {
          allResults.push({
            ...product,
            tenant: {
              id: tenant._id,
              name: tenant.name,
              slug: tenant.slug,
              logo: tenant.logo,
              currency: tenant.settings?.currency || 'PKR',
            },
          });
        });
      } catch {
        // Skip tenants with no products collection yet
      }
    }

    // Sort by relevance (name match > description match)
    allResults.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
      const bNameMatch = b.name.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
      return bNameMatch - aNameMatch;
    });

    const start = (page - 1) * limit;
    const paginated = allResults.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      query: q,
      data: paginated,
      total: allResults.length,
      page: parseInt(page),
      pages: Math.ceil(allResults.length / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
