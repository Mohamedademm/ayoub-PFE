const express = require('express');
const router = express.Router();
const {
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
  getCategories,
} = require('../controllers/annexeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAnnexes);
router.get('/categories', getCategories);
router.get('/:slug', getAnnexeBySlug);
router.post('/:slug/download', trackDownload);

module.exports = router;
