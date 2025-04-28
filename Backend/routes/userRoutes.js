
const express = require("express");
const { register, login, getUserProfile } = require("../controllers/userController.js");
const { body } = require("express-validator");
const auth = require("../middleware/authMiddleware.js");
const router = express.Router();


router.post(
  "/register",
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 })
  ],
  register
);


router.post(
  "/login",
  [
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password is required").exists()
  ],
  login
);


router.get("/profile", auth,getUserProfile);
module.exports = router;