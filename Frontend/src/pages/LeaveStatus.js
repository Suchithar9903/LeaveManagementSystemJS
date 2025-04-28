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

  // Map status to user-friendly messages
  const getStatusMessage = (status) => {
    const messages = {
      pending: "Your leave application is pending approval.",
      approved: "Your leave application has been approved.",
      rejected: "Your leave application has been rejected.",
    };
    return messages[status] || "Unknown status";
  };

  // Status badge component
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-warning",
      approved: "bg-success",
      rejected: "bg-danger",
    };
    return (
      <span className={`badge ${statusClasses[status] || "bg-secondary"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
            <div key={leave._id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Leave Request</h5>
                  <p className="card-text">
                    <strong>Type:</strong> {leave.leaveType}<br />
                    <strong>Start Date:</strong> {new Date(leave.startDate).toLocaleDateString()}<br />
                    <strong>End Date:</strong> {new Date(leave.endDate).toLocaleDateString()}<br />
                    <strong>Reason:</strong> {leave.reason}<br />
                    <strong>Status:</strong> {getStatusBadge(leave.status)}
                  </p>
                  <p className="text-muted">{getStatusMessage(leave.status)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveStatus;
