const Admin = require('../models/Admin.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");
const {sendNotification} = require("../notificationService.js");

const loginAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
const getPendingArtworks = async (req, res) => {
    try {
        const artworks = await Artwork.find({ status: "pending" }).populate("user", "name");;
        res.json(artworks);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const approveArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id).populate("user");
        if (!artwork) {
            return res.status(404).json({ message: "Artwork not found" });
        }

        artwork.status = "approved";
        await artwork.save();
        await sendNotification(artwork.user.id, `Your artwork "${artwork.title}" has been approved.`);
        res.json({ message: "Artwork approved successfully", artwork });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const rejectArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id).populate("user");
        if (!artwork) {
            return res.status(404).json({ message: "Artwork not found" });
        }

        artwork.status = "rejected";
        await artwork.save();
        await sendNotification(artwork.user.id, `Your artwork "${artwork.title}" has been rejected.`);
        res.json({ message: "Artwork rejected", artwork });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { loginAdmin, approveArtwork, rejectArtwork, getPendingArtworks };