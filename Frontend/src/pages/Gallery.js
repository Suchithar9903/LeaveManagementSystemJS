import React, { useEffect, useState, useRef } from "react";
import "../styles/Gallery.css";
import "../styles/app_style.css";
import API from "../axios.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchArtworksStart, fetchArtworksSuccess, fetchArtworksFailure, likeArtworkSuccess, commentArtworkSuccess } from "../redux/gallerySlice.js";

const Gallery = () => {
    const dispatch = useDispatch();
    const { artworks, loading, error } = useSelector((state) => state.gallery);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterArtist, setFilterArtist] = useState("");
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const modalOverlayRef = useRef(null); 

    useEffect(() => {
        fetchArtworks();
    }, [searchQuery, filterArtist]);

    const fetchArtworks = async () => {
        dispatch(fetchArtworksStart());
        try {
            const response = await API.get("/artworks", {
                params: {
                    status: "approved",
                    title: searchQuery,
                    artist: filterArtist
                }
            });
            dispatch(fetchArtworksSuccess(response.data));
        } catch (err) {
            console.error("Error fetching artworks");
            dispatch(fetchArtworksFailure("Failed to fetch artworks"));
        }
    };

    const openDetailView = (art) => {
        setSelectedArtwork(art);
        if (modalOverlayRef.current) {
            modalOverlayRef.current.classList.add('active'); 
        }
    };

    const closeDetailView = () => {
        setSelectedArtwork(null);
        setCommentText("");
        if (modalOverlayRef.current) {
            modalOverlayRef.current.classList.remove('active'); 
        }
    };

    const handleLike = async (artworkId) => {
        try {
            const response = await API.post(`/artworks/${artworkId}/like`);
            dispatch(likeArtworkSuccess(response.data.artwork));
            setSelectedArtwork(response.data.artwork)
        } catch (err) {
            console.error("Error liking artwork", err);
        }
    };

    const handleComment = async (artworkId) => {
        if (!commentText.trim()) return;
        try {
            const response = await API.post(`/artworks/${artworkId}/comment`, { text: commentText });
            dispatch(commentArtworkSuccess(response.data.artwork));
            setSelectedArtwork(response.data.artwork);
            setCommentText("");
        } catch (err) {
            console.error("Error adding comment", err);
        }
    };

    const handleReply = async(artworkId, commentId) => {
        if(!replyText.trim()) return;
        try{
            const response = await API.post(`/artworks/${artworkId}/comment/${commentId}/reply`, {text: replyText});
            dispatch(commentArtworkSuccess(response.data.artwork));
            setSelectedArtwork(response.data.artwork);
            setReplyText("");
            setReplyingTo(null);
        }catch(err){
            console.error("Error adding reply", err);
        }
    }

    return (
        <div className="gallery-container container mt-5">
            <div className="gallery-header">
                <h2>Art Gallery</h2>
                <button 
                    className="search-icon" 
                    onClick={() => setShowSearch(!showSearch)}
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                </button>
            </div>

            <div className={`search-filter-container mb-4 ${!showSearch ? 'hidden' : ''}`}>
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control mb-2"
                />
                <input
                    type="text"
                    placeholder="Filter by artist..."
                    value={filterArtist}
                    onChange={(e) => setFilterArtist(e.target.value)}
                    className="form-control mb-2"
                />
            </div>

            {loading && <div className="loading-spinner"></div>}
            {error && <p className="text-center text-danger">{error}</p>}
            {!loading && artworks.length === 0 && <p className="text-center">No artworks available.</p>}

            <div className="gallery">
                {artworks.map((art) => (
                    <div key={art._id} className="gallery-item" onClick={() => openDetailView(art)}>
                                <img src={art.imageUrl} alt={art.title}/>
                                <h3 className="gallery-title">{art.title}</h3>
                                <p className="gallery-artist">By {art.artist}</p>
                                <p className="gallery-submitted-by">Submitted by: {art.user?.name || "Unknown"}</p>
                                <button
                                    className="btn btn-like"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLike(art._id);
                                    }}
                                >
                                    ❤️ {art.likes.length}
                                </button>
                        </div>
                ))}
            </div>

            {selectedArtwork && (
                <div className="modal-overlay" ref={modalOverlayRef} onClick={closeDetailView}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={closeDetailView}>&times;</span>
                        <img src={selectedArtwork.imageUrl} alt={selectedArtwork.title} className="modal-image" />
                        <h2 className="modal-title">{selectedArtwork.title}</h2>
                        <p className="modal-artist"><strong>Artist:</strong> {selectedArtwork.artist}</p>
                        <p className="modal-description"><strong>Description:</strong> {selectedArtwork.description || "No description available."}</p>
                        <button
                            className="btn btn-like"
                            onClick={() => handleLike(selectedArtwork._id)}
                        >
                            ❤️ {selectedArtwork.likes.length}
                        </button>

                        <div className="comments-section">
                            <h4>Comments : {selectedArtwork.comments.length}</h4>
                            <ul className="comments-list">
                                {selectedArtwork.comments.map((comment) => (
                                <li key={comment._id} className="comment-item">
                                    <strong>{comment.user.name}:</strong> {comment.text}
                                    <button
                                        className="btn btn-reply"
                                        onClick={() => setReplyingTo(comment._id)}
                                    >
                                        Reply
                                    </button>

                                    {replyingTo === comment._id && (
                                    <div className="reply-input-container">
                                        <input
                                            type="text"
                                            className="reply-input"
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <button
                                            className="btn btn-comment"
                                            onClick={() => handleReply(selectedArtwork._id, comment._id)}
                                        >
                                            Post Reply
                                        </button>
                                    </div>
                                    )}

                                    {comment.replies && comment.replies.length > 0 && (
                                    <ul className="replies-list">
                                        {comment.replies.map((reply) => (
                                        <li key = {reply._id}className="reply-item">
                                            ↳ <strong>{reply.user?.name}:</strong> {reply.text}
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                </li>
                                ))}
                            </ul>

                            <div className="comment-input-container">
                                <input
                                type="text"
                                className="comment-input"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button
                                    className="btn btn-comment"
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    handleComment(selectedArtwork._id);
                                    }}
                                >
                                    Post Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;