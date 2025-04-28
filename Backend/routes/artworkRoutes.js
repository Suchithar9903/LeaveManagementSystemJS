const express = require('express');
const router = express.Router();
const {addArtwork, getArtworks, getArtworkById, likeArtwork, commentOnArtwork, addReply} = require("../controllers/artworkController.js");
const auth = require("../middleware/authMiddleware");

router.get("/", auth,getArtworks);
router.get("/:id", getArtworkById);
router.post("/:id/like", auth, likeArtwork); 
router.post("/:id/comment", auth, commentOnArtwork); 
router.post("/:id/comment/:commentId/reply", auth, addReply);
module.exports = router;