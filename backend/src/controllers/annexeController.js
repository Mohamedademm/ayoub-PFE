const Annexe = require('../models/Annexe');
const slugify = require('slugify');
const path = require('path');
const fs = require('fs');
const { generateQRCode } = require('../utils/qrcode');

/**
 * @desc    Get all active annexes (public)
 * @route   GET /api/annexes
 * @access  Public
 */
const getAnnexes = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const query = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [annexes, total] = await Promise.all([
      Annexe.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-qrCodeUrl'),
      Annexe.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: annexes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all annexes for admin (including inactive)
 * @route   GET /api/admin/annexes
 * @access  Private/Admin
 */
const getAdminAnnexes = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };
    if (category && category !== 'all') query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [annexes, total] = await Promise.all([
      Annexe.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Annexe.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: annexes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get annexe by slug (public)
 * @route   GET /api/annexes/:slug
 * @access  Public
 */
const getAnnexeBySlug = async (req, res) => {
  try {
    const annexe = await Annexe.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!annexe) {
      return res.status(404).json({
        success: false,
        message: 'Annexe not found.',
      });
    }

    // Increment views
    annexe.views += 1;
    await annexe.save({ validateBeforeSave: false });

    res.json({ success: true, data: annexe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get annexe by ID (admin)
 * @route   GET /api/admin/annexes/:id
 * @access  Private/Admin
 */
const getAnnexeById = async (req, res) => {
  try {
    const annexe = await Annexe.findById(req.params.id);
    if (!annexe) {
      return res.status(404).json({ success: false, message: 'Annexe not found.' });
    }
    res.json({ success: true, data: annexe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create annexe
 * @route   POST /api/admin/annexes
 * @access  Private/Admin
 */
const createAnnexe = async (req, res) => {
  try {
    const { title, description, category, tags, order } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required.' });
    }

    // Generate slug
    let slug = slugify(title, { lower: true, strict: true, locale: 'fr' });

    // Check slug uniqueness
    const existing = await Annexe.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // File URL (accessible via static serving or Cloudinary URL)
    const fileUrl = req.file.path && req.file.path.startsWith('http') 
      ? req.file.path 
      : `/uploads/${req.file.filename}`;

    // Page URL for QR Code
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const annexePageUrl = `${appUrl}/annexes/${slug}`;

    // Generate QR Code
    const qrCodeUrl = await generateQRCode(annexePageUrl);

    const annexe = await Annexe.create({
      title,
      slug,
      description,
      category,
      fileUrl,
      fileOriginalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      qrCodeUrl,
      annexePageUrl,
      tags: tags ? JSON.parse(tags) : [],
      order: order || 0,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: annexe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update annexe
 * @route   PUT /api/admin/annexes/:id
 * @access  Private/Admin
 */
const updateAnnexe = async (req, res) => {
  try {
    const { title, description, category, tags, order, isActive } = req.body;
    const annexe = await Annexe.findById(req.params.id);

    if (!annexe) {
      return res.status(404).json({ success: false, message: 'Annexe not found.' });
    }

    // Update fields
    if (title) annexe.title = title;
    if (description !== undefined) annexe.description = description;
    if (category) annexe.category = category;
    if (tags) annexe.tags = JSON.parse(tags);
    if (order !== undefined) annexe.order = order;
    if (isActive !== undefined) annexe.isActive = isActive === 'true' || isActive === true;

    // If new file uploaded
    if (req.file) {
      // Delete old file if exists
      if (annexe.fileUrl && annexe.fileUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../../uploads', path.basename(annexe.fileUrl));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      annexe.fileUrl = req.file.path && req.file.path.startsWith('http') 
        ? req.file.path 
        : `/uploads/${req.file.filename}`;
      annexe.fileOriginalName = req.file.originalname;
      annexe.fileSize = req.file.size;
      annexe.fileType = req.file.mimetype;
    }

    // If title changed, regenerate slug and QR code
    if (title && title !== annexe.title) {
      let newSlug = slugify(title, { lower: true, strict: true, locale: 'fr' });
      const existing = await Annexe.findOne({ slug: newSlug, _id: { $ne: annexe._id } });
      if (existing) newSlug = `${newSlug}-${Date.now()}`;
      annexe.slug = newSlug;

      const appUrl = process.env.APP_URL || 'http://localhost:5173';
      const annexePageUrl = `${appUrl}/annexes/${newSlug}`;
      annexe.annexePageUrl = annexePageUrl;
      annexe.qrCodeUrl = await generateQRCode(annexePageUrl);
    }

    await annexe.save();
    res.json({ success: true, data: annexe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete annexe
 * @route   DELETE /api/admin/annexes/:id
 * @access  Private/Admin
 */
const deleteAnnexe = async (req, res) => {
  try {
    const annexe = await Annexe.findById(req.params.id);

    if (!annexe) {
      return res.status(404).json({ success: false, message: 'Annexe not found.' });
    }

    // Delete file from disk
    if (annexe.fileUrl && annexe.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(annexe.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Annexe.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Annexe deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle annexe active status
 * @route   PATCH /api/admin/annexes/:id/toggle
 * @access  Private/Admin
 */
const toggleAnnexe = async (req, res) => {
  try {
    const annexe = await Annexe.findById(req.params.id);
    if (!annexe) {
      return res.status(404).json({ success: false, message: 'Annexe not found.' });
    }

    annexe.isActive = !annexe.isActive;
    await annexe.save({ validateBeforeSave: false });

    res.json({ success: true, data: annexe, message: `Annexe ${annexe.isActive ? 'activated' : 'deactivated'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Track download
 * @route   POST /api/annexes/:slug/download
 * @access  Public
 */
const trackDownload = async (req, res) => {
  try {
    await Annexe.findOneAndUpdate(
      { slug: req.params.slug, isActive: true },
      { $inc: { downloads: 1 } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res) => {
  try {
    const [
      totalAnnexes,
      activeAnnexes,
      inactiveAnnexes,
      totalViews,
      totalDownloads,
      byCategory,
      recentAnnexes,
    ] = await Promise.all([
      Annexe.countDocuments(),
      Annexe.countDocuments({ isActive: true }),
      Annexe.countDocuments({ isActive: false }),
      Annexe.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Annexe.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
      Annexe.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
        { $sort: { count: -1 } },
      ]),
      Annexe.find().sort('-createdAt').limit(5).select('title slug views downloads createdAt isActive'),
    ]);

    res.json({
      success: true,
      data: {
        totalAnnexes,
        activeAnnexes,
        inactiveAnnexes,
        totalViews: totalViews[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0,
        byCategory,
        recentAnnexes,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get public statistics
 * @route   GET /api/annexes/stats
 * @access  Public
 */
const getPublicStats = async (req, res) => {
  try {
    const [activeAnnexes, totalViews, totalDownloads] = await Promise.all([
      Annexe.countDocuments({ isActive: true }),
      Annexe.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
      Annexe.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$downloads' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        activeAnnexes,
        totalViews: totalViews[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get categories list
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  const categories = [
    'Documentation',
    'Code Source',
    'Schémas',
    "Captures d'écran",
    'Vidéos',
    'Rapports',
    'Données',
    'Autre',
  ];
  res.json({ success: true, data: categories });
};

module.exports = {
  getAnnexes,
  getAdminAnnexes,
  getAnnexeBySlug,
  getAnnexeById,
  createAnnexe,
  updateAnnexe,
  deleteAnnexe,
  toggleAnnexe,
  trackDownload,
  getStats,
  getPublicStats,
  getCategories,
};

