const express = require('express');
const { loginAdmin, approveArtwork, rejectArtwork, getPendingArtworks } = require('../controllers/adminController.js');

const router = express.Router();

router.post('/admin-login', loginAdmin);
router.put('/artworks/:id/approve', approveArtwork);
router.put('/artworks/:id/reject', rejectArtwork);
router.get("/artworks/pending", getPendingArtworks);

module.exports = router;