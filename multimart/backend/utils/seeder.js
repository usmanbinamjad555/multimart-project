const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const { getTenantModels } = require('../models/getTenantModels');

// ─── Working image URLs (Unsplash & placehold.co) ─────────────
const IMGS = {
  galaxyS24:   'https://placehold.co/400x400/6366f1/ffffff?text=Galaxy+S24',
  iphone15:    'https://placehold.co/400x400/1d1d1f/ffffff?text=iPhone+15+Pro',
  dellXps:     'https://placehold.co/400x400/0078d4/ffffff?text=Dell+XPS+15',
  sonyXm5:     'https://placehold.co/400x400/000000/ffffff?text=Sony+WH-XM5',
  samsungTablet:'https://placehold.co/400x400/1428a0/ffffff?text=Samsung+Tab',
  shalwar:     'https://placehold.co/400x400/16a34a/ffffff?text=Shalwar+Kameez',
  lawnSuit:    'https://placehold.co/400x400/db2777/ffffff?text=Lawn+Suit',
  kurta:       'https://placehold.co/400x400/9333ea/ffffff?text=Kurta',
  acService:   'https://placehold.co/400x400/0891b2/ffffff?text=AC+Service',
  cleaning:    'https://placehold.co/400x400/059669/ffffff?text=Cleaning',
  plumbing:    'https://placehold.co/400x400/d97706/ffffff?text=Plumbing',
};

const seed = async () => {
  await connectDB();
  console.log('\n🌱 Starting database seed...\n');

  try {
    await User.deleteMany({ role: { $ne: 'superadmin' } });
    await Tenant.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ─── Super Admin ─────────────────────────────────────────
    let superAdmin = await User.findOne({ role: 'superadmin' });
    if (!superAdmin) {
      superAdmin = await User.create({
        firstName: 'Super', lastName: 'Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'admin@multimart.com',
        password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345',
        role: 'superadmin',
      });
      console.log(`✅ Super Admin: ${superAdmin.email}`);
    }

    // ─── Tenant 1: TechZone ───────────────────────────────────
    const techAdmin = await User.create({
      firstName: 'Ali', lastName: 'Hassan',
      email: 'ali@techzone.pk', password: 'password123', role: 'tenant_admin',
    });
    const techTenant = await Tenant.create({
      name: 'TechZone',
      description: "Pakistan's leading electronics & gadgets store",
      category: 'Electronics',
      contactEmail: 'contact@techzone.pk',
      contactPhone: '0300-1234567',
      address: { city: 'Lahore', country: 'Pakistan' },
      owner: techAdmin._id,
      status: 'active',
      logo: 'https://placehold.co/80x80/6366f1/ffffff?text=TZ',
      stats: { totalProducts: 0, rating: 4.5, reviewCount: 124 },
    });
    techAdmin.tenantId = techTenant._id;
    await techAdmin.save({ validateBeforeSave: false });

    const { Product: TP, Category: TC } = getTenantModels(techTenant.schemaPrefix);
    const techCats = await TC.insertMany([
      { name: 'Smartphones', sortOrder: 1 },
      { name: 'Laptops', sortOrder: 2 },
      { name: 'Accessories', sortOrder: 3 },
      { name: 'Tablets', sortOrder: 4 },
    ]);

    await TP.insertMany([
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Top-of-the-line Samsung flagship with 200MP camera, S Pen, and 5000mAh battery. Built for professionals and power users alike.',
        shortDescription: 'Samsung flagship with 200MP camera & S Pen',
        price: 299999, compareAtPrice: 329999,
        categoryId: techCats[0]._id, categoryName: 'Smartphones',
        images: [{ url: IMGS.galaxyS24, isPrimary: true }],
        stock: 15, isFeatured: true, tags: ['samsung', 'smartphone', 'flagship', 'android'],
        stats: { rating: 4.8, reviewCount: 45 },
      },
      {
        name: 'iPhone 15 Pro Max',
        description: "Apple's most powerful iPhone with A17 Pro chip, titanium design, and USB-C. Features a 48MP main camera and Action Button.",
        shortDescription: "Apple's most powerful iPhone with titanium build",
        price: 389999, compareAtPrice: 410000,
        categoryId: techCats[0]._id, categoryName: 'Smartphones',
        images: [{ url: IMGS.iphone15, isPrimary: true }],
        stock: 8, isFeatured: true, tags: ['apple', 'iphone', 'smartphone', 'ios'],
        stats: { rating: 4.9, reviewCount: 89 },
      },
      {
        name: 'Dell XPS 15 Laptop',
        description: 'Premium Windows laptop with Intel Core i9, 32GB RAM, RTX 4070, and stunning 4K OLED display. Perfect for creators and developers.',
        shortDescription: 'Premium laptop with i9 & RTX 4070',
        price: 499999,
        categoryId: techCats[1]._id, categoryName: 'Laptops',
        images: [{ url: IMGS.dellXps, isPrimary: true }],
        stock: 5, isFeatured: true, tags: ['dell', 'laptop', 'windows', 'gaming'],
        stats: { rating: 4.7, reviewCount: 23 },
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling wireless headphones with 30-hour battery life and exceptional sound quality.',
        shortDescription: 'Best-in-class noise canceling headphones',
        price: 89999, compareAtPrice: 99999,
        categoryId: techCats[2]._id, categoryName: 'Accessories',
        images: [{ url: IMGS.sonyXm5, isPrimary: true }],
        stock: 20, isFeatured: false, tags: ['sony', 'headphones', 'wireless', 'anc'],
        stats: { rating: 4.6, reviewCount: 67 },
        discount: { type: 'percentage', value: 10, expiresAt: new Date(Date.now() + 7 * 86400000) },
      },
      {
        name: 'Samsung Galaxy Tab S9',
        description: 'High-performance Android tablet with AMOLED display, S Pen included, and DeX desktop mode support.',
        shortDescription: 'Premium Android tablet with S Pen',
        price: 149999, compareAtPrice: 169999,
        categoryId: techCats[3]._id, categoryName: 'Tablets',
        images: [{ url: IMGS.samsungTablet, isPrimary: true }],
        stock: 12, isFeatured: true, tags: ['samsung', 'tablet', 'android', 'amoled'],
        stats: { rating: 4.5, reviewCount: 31 },
      },
    ]);
    await Tenant.findByIdAndUpdate(techTenant._id, { 'stats.totalProducts': 5 });
    console.log('✅ TechZone seeded (5 products)');

    // ─── Tenant 2: FashionHub ─────────────────────────────────
    const fashionAdmin = await User.create({
      firstName: 'Fatima', lastName: 'Malik',
      email: 'fatima@fashionhub.pk', password: 'password123', role: 'tenant_admin',
    });
    const fashionTenant = await Tenant.create({
      name: 'FashionHub',
      description: 'Trendy Pakistani & international fashion for everyone',
      category: 'Fashion',
      contactEmail: 'contact@fashionhub.pk', contactPhone: '0321-9876543',
      address: { city: 'Karachi', country: 'Pakistan' },
      owner: fashionAdmin._id, status: 'active',
      logo: 'https://placehold.co/80x80/ec4899/ffffff?text=FH',
      stats: { totalProducts: 0, rating: 4.3, reviewCount: 87 },
    });
    fashionAdmin.tenantId = fashionTenant._id;
    await fashionAdmin.save({ validateBeforeSave: false });

    const { Product: FP, Category: FC } = getTenantModels(fashionTenant.schemaPrefix);
    const fashionCats = await FC.insertMany([
      { name: "Men's Wear", sortOrder: 1 },
      { name: "Women's Wear", sortOrder: 2 },
      { name: 'Accessories', sortOrder: 3 },
    ]);
    await FP.insertMany([
      {
        name: 'Premium Cotton Shalwar Kameez',
        description: 'Classic Pakistani shalwar kameez in premium cotton. Comfortable for daily wear and formal occasions. Available in multiple colors.',
        shortDescription: 'Premium cotton traditional wear — multiple colors',
        price: 3500, compareAtPrice: 4200,
        categoryId: fashionCats[0]._id, categoryName: "Men's Wear",
        images: [{ url: IMGS.shalwar, isPrimary: true }],
        stock: 50, isFeatured: true, tags: ['shalwar', 'kameez', 'traditional', 'cotton'],
        stats: { rating: 4.5, reviewCount: 32 },
        variants: [{ name: 'Size', options: [{ label: 'S', stock: 10 }, { label: 'M', stock: 15 }, { label: 'L', stock: 15 }, { label: 'XL', stock: 10 }] }],
      },
      {
        name: 'Embroidered Lawn 3-Piece Suit',
        description: 'Beautiful embroidered lawn 3-piece suit. Perfect for formal occasions, Eid, and family gatherings.',
        shortDescription: 'Embroidered 3-piece lawn suit for women',
        price: 5500, compareAtPrice: 6500,
        categoryId: fashionCats[1]._id, categoryName: "Women's Wear",
        images: [{ url: IMGS.lawnSuit, isPrimary: true }],
        stock: 30, isFeatured: true, tags: ['lawn', 'suit', 'embroidered', 'eid'],
        stats: { rating: 4.4, reviewCount: 28 },
      },
      {
        name: 'Casual Printed Kurta',
        description: 'Lightweight casual kurta with modern printed design. Perfect for everyday wear.',
        shortDescription: 'Casual printed kurta for daily wear',
        price: 1800, compareAtPrice: 2200,
        categoryId: fashionCats[0]._id, categoryName: "Men's Wear",
        images: [{ url: IMGS.kurta, isPrimary: true }],
        stock: 40, isFeatured: false, tags: ['kurta', 'casual', 'printed'],
        stats: { rating: 4.2, reviewCount: 18 },
      },
    ]);
    await Tenant.findByIdAndUpdate(fashionTenant._id, { 'stats.totalProducts': 3 });
    console.log('✅ FashionHub seeded (3 products)');

    // ─── Tenant 3: SwiftServices ──────────────────────────────
    const serviceAdmin = await User.create({
      firstName: 'Usman', lastName: 'Raza',
      email: 'usman@swiftservices.pk', password: 'password123', role: 'tenant_admin',
    });
    const serviceTenant = await Tenant.create({
      name: 'SwiftServices',
      description: 'Professional home services — AC, plumbing, cleaning & electrical',
      category: 'Services',
      contactEmail: 'contact@swiftservices.pk', contactPhone: '0333-5551234',
      address: { city: 'Islamabad', country: 'Pakistan' },
      owner: serviceAdmin._id, status: 'active',
      logo: 'https://placehold.co/80x80/10b981/ffffff?text=SS',
      stats: { totalProducts: 0, rating: 4.7, reviewCount: 156 },
    });
    serviceAdmin.tenantId = serviceTenant._id;
    await serviceAdmin.save({ validateBeforeSave: false });

    const { Product: SP, Category: SC } = getTenantModels(serviceTenant.schemaPrefix);
    const serviceCats = await SC.insertMany([
      { name: 'HVAC & Cooling', sortOrder: 1 },
      { name: 'Cleaning', sortOrder: 2 },
      { name: 'Plumbing', sortOrder: 3 },
    ]);
    await SP.insertMany([
      {
        name: 'AC Installation & Gas Refill',
        description: 'Professional AC installation and gas refilling by certified technicians. Covers split ACs, window ACs, and inverter units.',
        shortDescription: 'Certified AC installation & servicing',
        price: 2500,
        categoryId: serviceCats[0]._id, categoryName: 'HVAC & Cooling',
        images: [{ url: IMGS.acService, isPrimary: true }],
        stock: 999, isFeatured: true, isService: true,
        serviceDetails: { duration: '2-3 hours', deliveryTime: 'Same day', serviceArea: ['Islamabad', 'Rawalpindi'] },
        tags: ['ac', 'installation', 'cooling', 'hvac'],
        stats: { rating: 4.8, reviewCount: 67 },
      },
      {
        name: 'Deep Home Cleaning Package',
        description: 'Professional deep cleaning for 3-5 bedroom homes. Includes kitchen, bathrooms, bedrooms, and living areas with eco-friendly products.',
        shortDescription: 'Full home deep cleaning by professionals',
        price: 4500,
        categoryId: serviceCats[1]._id, categoryName: 'Cleaning',
        images: [{ url: IMGS.cleaning, isPrimary: true }],
        stock: 999, isFeatured: true, isService: true,
        serviceDetails: { duration: '4-6 hours', deliveryTime: 'Next day', serviceArea: ['Islamabad', 'Rawalpindi', 'Lahore'] },
        tags: ['cleaning', 'home', 'deep clean', 'maid'],
        stats: { rating: 4.6, reviewCount: 45 },
      },
      {
        name: 'Emergency Plumbing Repair',
        description: 'Fast emergency plumbing repair for leaks, clogs, burst pipes, and drainage issues. Available 24/7.',
        shortDescription: '24/7 emergency plumbing repair',
        price: 1500,
        categoryId: serviceCats[2]._id, categoryName: 'Plumbing',
        images: [{ url: IMGS.plumbing, isPrimary: true }],
        stock: 999, isFeatured: false, isService: true,
        serviceDetails: { duration: '1-2 hours', deliveryTime: 'Within 2 hours', serviceArea: ['Islamabad', 'Rawalpindi'] },
        tags: ['plumbing', 'repair', 'emergency', 'leak'],
        stats: { rating: 4.7, reviewCount: 39 },
      },
    ]);
    await Tenant.findByIdAndUpdate(serviceTenant._id, { 'stats.totalProducts': 3 });
    console.log('✅ SwiftServices seeded (3 services)');

    // ─── Sample Customers ─────────────────────────────────────
    await User.insertMany([
      { firstName: 'Ahmed', lastName: 'Khan', email: 'ahmed@example.com', password: 'password123', role: 'customer', phone: '0311-1111111' },
      { firstName: 'Sara', lastName: 'Ahmed', email: 'sara@example.com', password: 'password123', role: 'customer', phone: '0322-2222222' },
    ]);
    console.log('✅ Sample customers created');

    console.log('\n🎉 Seed complete!\n');
    console.log('─────────────────────────────────────────────────');
    console.log('📧 Super Admin:        admin@multimart.com   / Admin@12345');
    console.log('📧 TechZone Admin:     ali@techzone.pk       / password123');
    console.log('📧 FashionHub Admin:   fatima@fashionhub.pk  / password123');
    console.log('📧 SwiftServices:      usman@swiftservices.pk / password123');
    console.log('📧 Customer:           ahmed@example.com     / password123');
    console.log('─────────────────────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
  process.exit();
};

seed();
