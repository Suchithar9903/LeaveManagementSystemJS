import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios.js";
import "../styles/admin.css"
import { toast } from "react-toastify";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [pendingArtworks, setPendingArtworks] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin-login");
        } else {
            fetchPendingArtworks();
        }
    }, [navigate]);

    const fetchPendingArtworks = async () => {
        try {
            const response = await API.get("admins/artworks/pending"); 
            setPendingArtworks(response.data);
        } catch (err) {
            console.error("Error fetching pending artworks", err);
        }
    };

    const handleApprove = async (artworkId) => {
        try {
            await API.put(`/admins/artworks/${artworkId}/approve`);
            setPendingArtworks(pendingArtworks.filter((art) => art._id !== artworkId));
            toast.success("Artwork as been approved");
        } catch (err) {
            console.error("Error approving artwork", err);
        }
    };

    const handleReject = async (artworkId) => {
        try {
            await API.put(`/admins/artworks/${artworkId}/reject`);
            setPendingArtworks(pendingArtworks.filter((art) => art._id !== artworkId));
            toast.error("Artwork has been rejected");
        } catch (err) {
            console.error("Error rejecting artwork", err);
        }
    };


    return (
        <div className="container py-5">
            <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Welcome to Admin Panel</h2>
            </div>

            <h3 className="text-center text-secondary">Pending Artworks</h3>
            {pendingArtworks.length === 0 ? (
                <p className="text-center text-muted">No pending artworks.</p>
            ) : (
                <div className="row justify-content-center">
                    {pendingArtworks.map((art) => (
                        <div key={art._id} className="col-md-4">
                            <div className="card">
                                <img src={art.imageUrl} alt={art.title} className="card-img-top" />
                                <div className="card-body">
                                    <h4 className="card-title text-dark">{art.title}</h4>
                                    <p className="card-text text-muted">By {art.artist}</p>
                                    <p>Submitted by: {art.user?.name || "Unknown"}</p>
                                    <button className="btn btn-success me-2" onClick={() => handleApprove(art._id)}>Approve</button>
                                    <button className="btn btn-danger" onClick={() => handleReject(art._id)}>Reject</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;