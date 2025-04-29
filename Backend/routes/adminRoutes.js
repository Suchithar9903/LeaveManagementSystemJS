const express = require('express');
const { loginAdmin, getLeaveStats } = require('../controllers/adminController.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');

const router = express.Router();

router.post('/admin-login', loginAdmin);
// Protected reporting route
router.get('/leave-stats', adminMiddleware, getLeaveStats);

module.exports = router;