const express = require("express");
const { getNotifications, markAsRead } = require("../controllers/notificationController.js");
const auth = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/",auth, getNotifications);
router.put("/:id/read",auth, markAsRead);

module.exports = router;