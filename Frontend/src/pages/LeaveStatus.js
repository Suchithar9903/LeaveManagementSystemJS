import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaveStatus } from "../redux/leaveSlice.js";
import "../styles/app_style.css";
import "../styles/leavestatus.css";
import { toast } from "react-toastify";

const LeaveStatus = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { leaves, loading, error } = useSelector((state) => state.leave);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view leave status");
      navigate("/login");
    } else {
      dispatch(fetchLeaveStatus());
    }
  }, [navigate, dispatch]);

  // Helper function to get badge style
  const getStatusBadgeStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { backgroundColor: "#ffc107", color: "#212529" }; // Yellow
      case "approved":
      case "accepted":
        return { backgroundColor: "#28a745", color: "#fff" }; // Green
      case "rejected":
        return { backgroundColor: "#dc3545", color: "#fff" }; // Red
      default:
        return { backgroundColor: "#6c757d", color: "#fff" }; // Grey for unknown
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Leave Status</h2>
      {leaves.length === 0 ? (
        <div className="alert alert-info">No leave requests found.</div>
      ) : (
        <div className="row">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="leave-container"
              style={{
                position: "relative",
                marginBottom: "24px", // space between containers
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                padding: "24px",
                background: "#fff",
              }}
              >
              {/* Status Badge */}
              <span
                style={{
                  ...getStatusBadgeStyle(leave.status),
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  padding: "6px 16px",
                  borderRadius: "16px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  zIndex: 10,
                }}
              >
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              </span>

              {/* Leave details */}
              <div><strong>Type:</strong> {leave.leaveType}</div>
              <div><strong>Start Date:</strong> {new Date(leave.startDate).toLocaleDateString()}</div>
              <div><strong>End Date:</strong> {new Date(leave.endDate).toLocaleDateString()}</div>
              <div><strong>Reason:</strong> {leave.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveStatus;
