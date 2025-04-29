import React from "react";
import "../styles/banner.css";
import { useNavigate } from "react-router-dom";

function HomeBanner() {
    const navigate = useNavigate();

    const handleExplore = () => {
        const userToken = localStorage.getItem("token");
        if(userToken){
            try {
                const decodedToken = JSON.parse(atob(userToken.split('.')[1]));
                const role = decodedToken.user && decodedToken.user.role ? decodedToken.user.role.toLowerCase() : "";
                if(role === "manager"){
                    navigate("/manager-dashboard");
                } else {
                    navigate("/apply-leave");
                }
            } catch (e) {
                navigate("/apply-leave");
            }
        }else{
            navigate("/login");
        }
    };

    return (
        <div className="banner">
            <div className="banner-text">
                <h2>Leave Management System</h2>
                <p>Manager your Leaves and track them here!</p>
                <button className="explore-btn" onClick={handleExplore}>
                    Get Started
                </button>
            </div>
        </div>
    );
}


export default HomeBanner;