const Leave = require("../models/Leave.js");
const User = require("../models/User.js");
const { sendNotification } = require("../notificationService.js");
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateLeaveRequest = [
  body('startDate').isISO8601().withMessage('Invalid start date format'),
  body('endDate').isISO8601().withMessage('Invalid end date format'),
  body('leaveType').isIn(['casual', 'sick', 'earned']).withMessage('Invalid leave type'),
  body('reason').notEmpty().withMessage('Reason is required')
];

// Helper function to calculate leave days and dates
const calculateLeaveDetails = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateList = [];
  let count = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) { // Exclude weekends
      dateList.push(d.toISOString().split('T')[0]);
      count++;
    }
  }

  return { leaveDays: count, leaveDates: dateList };
};

// Submit a new leave request
const applyLeave = async (req, res) => {
  try {
    // Check for validation errors (assuming you're using express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure request body
    const { startDate, endDate, reason, leaveType } = req.body;
    const userId = req.user.id || req.body.userId;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    if (start < new Date()) {
      return res.status(400).json({ error: "Cannot apply for leave in the past" });
    }

    // Calculate leave days and dates (ensure this helper function is defined elsewhere)
    const { leaveDays, leaveDates } = calculateLeaveDetails(startDate, endDate);

    if (leaveDays === 0) {
      return res.status(400).json({ error: "Selected dates include only weekends. Please select valid days." });
    }

    // Check if user exists in the database
    const user = await User.findById(userId);
    if (!userId) {
      return res.status(404).json({ error: "User ID is required" });
    }

    // Create the leave request
    const newLeave = new Leave({
      userId: userId,  // Store user ID correctly in the Leave schema
      startDate,
      endDate,
      leaveType,
      reason,
      leaveDays,
      leaveDates,
      status: "Pending"  // Default status
    });

    // Save leave request
    await newLeave.save();

    // Add the leave request to the user's leaveApplications array
    user.leaveApplications.push(newLeave._id);
    await user.save();

    // Send success response
    res.status(201).json({ 
      message: "Leave request submitted successfully", 
      leave: newLeave 
    });

    // Send notification asynchronously (don't block the response)
    try {
      await sendNotification(userId, `Leave request submitted from ${startDate} to ${endDate}`);
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
      // Notification failure should not block leave submission
    }
  } catch (error) {
    // General error handler
    console.error("Error in applyLeave:", error);
    res.status(500).json({ error: "Failed to submit leave request. Please try again." });
  }
};


// User fetches their leave applications
const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const leaves = await Leave.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error in getMyLeaves:", error);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
};

// Add this at the end with your other exports if you want a dedicated function
const getLeaveStatus = async (req, res) => {
  try {
    const userId = req.user.id || req.body.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const leaves = await Leave.find({ userId: req.user.id }).populate("userId", "name email").sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leave status" });
  }
};

// Admin or Manager updates leave status
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leaveId = req.params.id;

    const leave = await Leave.findById(leaveId).populate("user", "name email");
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    await leave.save();

    const message = `Your leave request from ${leave.startDate} to ${leave.endDate} has been ${status}.`;
    await sendNotification(leave.user._id, message);

    res.json({ message: `Leave request ${status}`, leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  applyLeave,
  validateLeaveRequest,
  getMyLeaves,
  getLeaveStatus,
  updateLeaveStatus
};
