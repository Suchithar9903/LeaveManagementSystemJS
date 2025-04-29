const Admin = require('../models/Admin.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Leave = require('../models/Leave.js');

// Admin login only
const loginAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: admin.id, role: 'admin', email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Admin leave statistics and reporting
const getLeaveStats = async (req, res) => {
    try {
        // Aggregate total leaves, by type, by status, monthly trends
        const totalLeaves = await Leave.countDocuments();
        const byType = await Leave.aggregate([
            { $group: { _id: '$leaveType', count: { $sum: 1 } } }
        ]);
        const byStatus = await Leave.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const monthlyTrends = await Leave.aggregate([
            { $group: {
                _id: { year: { $year: '$startDate' }, month: { $month: '$startDate' } },
                count: { $sum: 1 }
            } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        // Aggregate monthly leave counts by status
        const monthlyStatusTrends = await Leave.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$startDate' },
                        month: { $month: '$startDate' },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        res.status(200).json({ totalLeaves, byType, byStatus, monthlyTrends, monthlyStatusTrends });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leave statistics' });
    }
};

module.exports = { loginAdmin, getLeaveStats };