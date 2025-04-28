const express = require("express");
const leaveController = require("../controllers/LeaveController");
const auth = require("../middleware/authMiddleware.js");
const { checkRole } = require("../middleware/checkRoleMiddleware.js");
const router = express.Router();

router.post("/apply", auth, leaveController.validateLeaveRequest, leaveController.applyLeave);
router.get("/my-leaves", auth, leaveController.getMyLeaves);
router.patch("/update-status/:id", auth, checkRole("admin", "manager"), leaveController.updateLeaveStatus);

module.exports = router;
