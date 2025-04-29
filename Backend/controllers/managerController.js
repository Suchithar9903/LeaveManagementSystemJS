const Leave = require('../models/Leave.js');
const jwt = require('jsonwebtoken');
const { sendNotification } = require('../notificationService.js');

// Get all pending leaves (for manager/admin)
const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "Pending" }).populate("userId", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ error: "Failed to Fetch Pending Leaves" });
  }
};

// Approve a leave request
const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('userId');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = 'Approved';
    await leave.save();

    // Notify the employee
    await sendNotification(
      leave.userId.id,
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
    const leave = await Leave.findById(req.params.id).populate('userId');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = 'Rejected';
    await leave.save();

    // Notify the employee
    await sendNotification(
      leave.userId.id,
      `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been rejected.`
    );

    res.json({ message: 'Leave rejected', leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getApprovedLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "Approved" }).populate("userId", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch approved leaves" });
  }
};

const getRejectedLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "Rejected" }).populate("userId", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rejected leaves" });
  }
};

module.exports = {
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getApprovedLeaves,
  getRejectedLeaves
};
