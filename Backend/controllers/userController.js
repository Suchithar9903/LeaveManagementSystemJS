const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User.js");
const Artwork = require("../models/Artwork.js");


const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, bio, gender } = req.body;

  try {
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

   
    user = new User({
      name,
      email,
      password,
      bio: bio || "",
      gender: gender || ""
    });

    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    
    await user.save();

    
    const payload = {
      user: {
        id: user.id
      }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    
    const payload = {
      user: {
        id: user.id
      }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const { bio, gender } = req.body;

    if (bio !== undefined) user.bio = bio;
    if (gender !== undefined) user.gender = gender;

    await user.save();
    res.json({ msg: "Profile updated successfully", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("likedArtworks"); 
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getUserLikedArtworks = async (req, res) => {
  try{
    const user = await User.findById(req.user.id).populate("likedArtworks");
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    res.json(user.likedArtworks);
  }catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserComments = async (req,res) => {
  try{
    const artworks = await Artwork.find({"comments.user" : req.user.id}, "title comments");
    const userComments = artworks.map(artwork => ({
      artworkTitle : artwork.title,
      comments : artwork.comments.filter(comment => comment.user.toString() === req.user.id)
    }));
    res.json(userComments);
  }catch (error) {
    res.status(500).json({ error: error.message });
}
}
const getUserUploadedArtworks = async (req, res) => {
  try {
      const user = await User.findById(req.user.id).populate({
        path: "uploadedArtworks",
        match: {status: "approved"}
      });
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      const approvedArtworks = user.uploadedArtworks.filter(artwork => artwork !== null);
      res.json(approvedArtworks);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
module.exports = { register, login, updateProfile, getUserProfile, getUserLikedArtworks, getUserComments, getUserUploadedArtworks };