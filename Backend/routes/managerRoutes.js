// src/routes/managerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPendingLeaves, getApprovedLeaves, getRejectedLeaves,
  approveLeave,
  rejectLeave,
} = require('../controllers/managerController.js');
const auth = require('../middleware/authMiddleware.js');

router.get('/pending', auth, getPendingLeaves);
router.get('/approved', auth, getApprovedLeaves);
router.get('/rejected', auth, getRejectedLeaves);
router.put('/:id/approve', auth, approveLeave);
router.put('/:id/reject', auth, rejectLeave);

module.exports = router;

