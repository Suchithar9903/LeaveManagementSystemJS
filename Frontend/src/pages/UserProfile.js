import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../redux/UserSlice.js";
import { FaUser, FaEnvelope } from "react-icons/fa";
import "../styles/profile.css";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (status === "loading") return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <h3><FaUser /> Profile</h3>
        <p className="form-control mb-3"><strong><FaUser /> Name:</strong> {user?.name}</p>
        <p className="form-control mb-3"><strong><FaEnvelope /> Email:</strong> {user?.email}</p>

        <label>Role:</label>
        <p className="form-control mb-3">
          {user?.role ? user.role : "Not Specified"}
        </p>
      </div>
    </div>
  );
};

export default Profile;
