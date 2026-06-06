const express = require('express');
const router = express.Router();
const {
  getAdminAnnexes,
  getAnnexeById,
  createAnnexe,
  updateAnnexe,
  deleteAnnexe,
  toggleAnnexe,
  getStats,
} = require('../controllers/annexeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// Stats
router.get('/stats', getStats);

// Annexes CRUD
router.get('/annexes', getAdminAnnexes);
router.get('/annexes/:id', getAnnexeById);
router.post('/annexes', upload.single('file'), createAnnexe);
router.put('/annexes/:id', upload.single('file'), updateAnnexe);
router.delete('/annexes/:id', deleteAnnexe);
router.patch('/annexes/:id/toggle', toggleAnnexe);

module.exports = router;
