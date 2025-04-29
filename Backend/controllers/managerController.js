const Leave = require('../models/Leave.js');
const jwt = require('jsonwebtoken');
const { sendNotification } = require('../notificationService.js');

// Get all pending leaves (for manager/admin)
const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "Pending" }).populate("user", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending leaves" });
  }
};

// Approve a leave request
const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('user');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = 'approved';
    await leave.save();

    // Notify the employee
    await sendNotification(
      leave.user.id,
      `Your leave from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been approved.`
    );

    res.json({ message: 'Leave approved successfully', leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Reject a leave request
const rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('user');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = 'rejected';
    await leave.save();

    // Notify the employee
    await sendNotification(
      leave.user.id,
      `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been rejected.`
    );

    res.json({ message: 'Leave rejected', leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPendingLeaves,
  approveLeave,
  rejectLeave,
};
