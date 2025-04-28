import { useState } from "react";
import API from "../axios.js";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); 

        try {
            const res = await API.post("admins/admin-login", { email, password });
            localStorage.setItem("adminToken", res.data.token); 
            onLogin();
            navigate("/dashboard"); 
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="auth-container container mt-3">
            <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
            <h2 className="text-center mb-4">Admin Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control mb-3" required />
                <br />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control mb-3" required />
                <br />
                <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
            </div>
        </div>
    );
};

export default AdminLogin;