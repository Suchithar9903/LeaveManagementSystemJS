const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.js');

const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(403).json({ message: 'Access denied: Not an admin' });
        }
        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = adminMiddleware;