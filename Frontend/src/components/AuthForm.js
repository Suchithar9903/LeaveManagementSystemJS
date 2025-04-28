import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios.js";
import "../styles/auth.css";
import { toast } from "react-toastify";

const AuthForm = ({ isLogin, onLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee", // Default to "employee"
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        const res = await API.post("users/login", {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", res.data.token);
        toast.success("Login successful");

        // Redirect based on user role
        if (res.data.role === "manager") {
          navigate("/manager"); // Assuming manager's page is /manager
        } else {
          navigate("/"); // Redirect to home for employee
        }

        if (onLogin) {
          onLogin();
        }
      } else {
        await API.post("users/register", formData);
        toast.success("Registration successful");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "User already exists or Invalid Credentials");
      toast.error("User exists or Invalid credentials");
    }
  };

  return (
    <div className="auth-container container mt-3">
      <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">{isLogin ? "Login" : "Register"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full name"
              onChange={handleChange}
              className="form-control mb-3"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="form-control mb-3"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="form-control mb-3"
            required
          />

          {/* Role selection for registration */}
          {!isLogin && (
            <div className="mb-3">
              <label>Role</label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="employee"
                    checked={formData.role === "employee"}
                    onChange={handleChange}
                  />
                  Employee
                </label>
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="manager"
                    checked={formData.role === "manager"}
                    onChange={handleChange}
                  />
                  Manager
                </label>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>
        <p className="text-center mt-3">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <a href={isLogin ? "/register" : "/login"} className="text-decoration-none">
            {isLogin ? "Register" : "Login"}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
