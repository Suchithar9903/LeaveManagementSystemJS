import { useState } from "react";
import API from "../axios.js";
import "../styles/upload.css";
import { toast } from "react-toastify";

const UploadArtwork = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        const newArtworks = files.map((file) => ({
            title: "",
            artist: "",
            description: "",
            image: file,
        }));
        setArtworks([...artworks, ...newArtworks]);
    };

    const handleInputChange = (index, field, value) => {
        const updatedArtworks = [...artworks];
        updatedArtworks[index][field] = value;
        setArtworks(updatedArtworks);
    };

    const handleRemove = (index) => {
        const updatedArtworks = artworks.filter((_, i) => i !== index);
        setArtworks(updatedArtworks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (artworks.length === 0) {
            toast.warning("Please upload at least one artwork.");
            return;
        }

        setLoading(true);

        try {
            for (let art of artworks) {
                if (!art.title || !art.artist || !art.image) {
                    toast.warning("All fields are required for each artwork");
                    setLoading(false);
                    return;
                }

                const formData = new FormData();
                formData.append("title", art.title);
                formData.append("artist", art.artist);
                formData.append("description", art.description);
                formData.append("image", art.image);

                await API.post("/artworks/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                });
            }

            toast.success("Artworks sent for approval");
            setArtworks([]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload artworks");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-container container mt-5">
            <div className="card p-4 mx-auto" style={{ maxWidth: "800px" }}>
                <h2 className="text-center mb-4">Submit Multiple Artworks</h2>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="form-control mb-3"
                    onChange={handleFilesChange}
                />

                {artworks.map((art, index) => (
                    <div key={index} className="artwork-item mb-4 p-3 border rounded">
                        <img
                            src={URL.createObjectURL(art.image)}
                            alt="Preview"
                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                            className="mb-2"
                        />
                        <input
                            type="text"
                            placeholder="Title"
                            value={art.title}
                            onChange={(e) => handleInputChange(index, "title", e.target.value)}
                            className="form-control mb-2"
                        />
                        <input
                            type="text"
                            placeholder="Artist"
                            value={art.artist}
                            onChange={(e) => handleInputChange(index, "artist", e.target.value)}
                            className="form-control mb-2"
                        />
                        <textarea
                            placeholder="Description"
                            value={art.description}
                            onChange={(e) => handleInputChange(index, "description", e.target.value)}
                            className="form-control mb-2"
                        ></textarea>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemove(index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}

                {artworks.length > 0 && (
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit All"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default UploadArtwork;