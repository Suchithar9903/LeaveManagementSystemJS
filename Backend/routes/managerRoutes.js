// src/routes/managerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPendingLeaves,
  approveLeave,
  rejectLeave,
} = require('../controllers/managerController.js');
const { auth, checkRole } = require('../middleware/authMiddleware.js');

router.get('/leaves/pending', auth, checkRole("admin", "manager"), getPendingLeaves);
router.put('/leaves/:id/approve', auth, checkRole("admin", "manager"), approveLeave);
router.put('/leaves/:id/reject', auth, checkRole("admin", "manager"), rejectLeave);

module.exports = router;
