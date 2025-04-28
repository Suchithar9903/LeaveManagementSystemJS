const Artwork = require("../models/Artwork.js");
const User = require("../models/User.js");
const {sendNotification} = require("../notificationService.js");
const addArtwork = async (req, res) => {
    try {
        const { title, artist, description } = req.body;
        const imageUrl = req.file.path;
        const userId = req.user.id;

        const newArtwork = new Artwork({
            title,
            artist,
            imageUrl,
            description,
            status: "pending" ,
            user: userId
        });
        await newArtwork.save();

        const user = await User.findById(userId);
        user.uploadedArtworks.push(newArtwork._id);
        await user.save();

        res.status(201).json({ message: "Artwork added successfully, pending approval", artwork: newArtwork });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getArtworks = async (req, res) => {
    try {
        const {title, artist} = req.query;
        const filter = {status : "approved"};
        if(title) {
            filter.title = {$regex: title, $options: "i"};
        }
        if(artist){
            filter.artist = {$regex: artist, $options: "i"};
        }
        const artworks = await Artwork.find(filter) 
            .populate("likes", "name")
            .populate("comments.user", "name")
            .populate("comments.replies.user", "name")
            .populate("user", "name");
        res.status(200).json(artworks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getArtworkById = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id)
            .populate("user", "name")
            .populate("likes", "name")
            .populate("comments.user", "name")
            .populate("comments.replies.user", "name");

        if (!artwork) {
            return res.status(404).json({ message: "Artwork not found" });
        }

        if (artwork.status !== "approved") {
            return res.status(403).json({ message: "This artwork is not approved yet" });
        }

        res.status(200).json(artwork);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likeArtwork = async (req, res) => {
    try {
        const userId = req.user.id;
        const artworkId = req.params.id;

        const artwork = await Artwork.findById(artworkId).populate("user", "name");
        if (!artwork || artwork.status !== "approved") {
            return res.status(404).json({ message: "Artwork not found or not approved yet" });
        }

        const user = await User.findById(userId);

        if (artwork.likes.includes(userId)) {
            artwork.likes = artwork.likes.filter(id => id.toString() !== userId);
            user.likedArtworks = user.likedArtworks.filter(id => id.toString() !== artworkId);
            await artwork.save();
            await user.save();

            const updatedArtwork = await Artwork.findById(artworkId)
            .populate("user", "name")
            .populate("likes", "name")
            .populate({
                path:"comments",
                populate: {
                    path: "user replies.user",
                    select: "name"
                }
            })
            return res.json({ message: "Artwork unliked", artwork: updatedArtwork });
        }

        artwork.likes.push(userId);
        user.likedArtworks.push(artworkId);
        await artwork.save();
        await user.save();
        const message = `${user.name} liked your artwork "${artwork.title}".`;
        await sendNotification(artwork.user._id, message);
        const updatedArtwork = await Artwork.findById(artworkId)
            .populate("user", "name")
            .populate("likes", "name")
            .populate({
                path:"comments",
                populate: {
                    path: "user replies.user",
                    select: "name"
                }
            })
        res.json({ message: "Art Liked", artwork: updatedArtwork });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const commentOnArtwork = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user.id;
        const artworkId = req.params.id;

        if (!text) {
            return res.status(400).json({ message: "Comment text required" });
        }

        const artwork = await Artwork.findById(artworkId).populate("user", "name");
        if (!artwork || artwork.status !== "approved") {
            return res.status(404).json({ message: "Artwork not found or not approved yet" });
        }

        const comment = { user: userId, text };
        artwork.comments.push(comment);
        await artwork.save();
        const user = await User.findById(userId);
        const message = `${user.name} commented on your artwork "${artwork.title}" : "${text}".`
        await sendNotification(artwork.user._id, message);
        const updatedArtwork = await Artwork.findById(artworkId).populate("user", "name").populate("comments.user","name");
        res.json({ message: "Comment added", artwork: updatedArtwork });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const addReply = async(req, res) => {
    try{
        const {text} = req.body;
        const userId = req.user.id;
        const artworkId = req.params.id;
        const commentId = req.params.commentId;
        if(!text){
            return res.status(400).json({message: "comment text required"})
        }

        const artwork = await Artwork.findById(artworkId);

        if(!artwork || artwork.status !== "approved"){
            return res.status(404).json({message: "Artwork not found or not approved"});
        }
        const comment = artwork.comments.id(commentId);
        if(!comment){
            return res.status(404).json({message:"Comment not found"})
        }
        const reply = {
            user: userId,
            text
        };

        comment.replies.push(reply);
        await artwork.save();
        const user = await User.findById(userId);
        const commentAuthor = await User.findById(comment.user);
        const message = `${user.name} replied to your comment on "${artwork.title}" : "${text}".`;
        await sendNotification(commentAuthor._id, message);
        const updatedArtwork = await Artwork.findById(artworkId)
        .populate("user","name")
        .populate("comments.user", "name")
        .populate("comments.replies.user", "name")
        .populate("likes.user", "name")
        .populate("likes.replies.user","name");
        res.json({message: "Reply added successfully", artwork: updatedArtwork});
    }catch(error){
        return res.status(500).json({error: error.message})
    }
};
module.exports = { addArtwork, getArtworks, getArtworkById, likeArtwork, commentOnArtwork, addReply };