const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin.js");

const adminMiddleware = async (req, res, next) => {
    try {
        const adminToken = req.header("Authorization").replace("Bearer ", "");
        if (!adminToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(403).json({ message: "Access denied" });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = adminMiddleware;