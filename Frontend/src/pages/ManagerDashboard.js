import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingLeaves,
  fetchApprovedLeaves,
  fetchRejectedLeaves,
  approveLeave,
  rejectLeave
} from "../redux/managerSlice.js";
import { Button } from "../components/ui/button.js";
import "../styles/managerdashboard.css";

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { pendingLeaves, approvedLeaves, rejectedLeaves, status, error } = useSelector((state) => state.manager);
  const [activeTab, setActiveTab] = useState("Pending");

  useEffect(() => {
    if (activeTab === "Pending") dispatch(fetchPendingLeaves());
    if (activeTab === "Approved") dispatch(fetchApprovedLeaves());
    if (activeTab === "Rejected") dispatch(fetchRejectedLeaves());
  }, [dispatch, activeTab]);

  const handleApprove = (leaveId) => {
    dispatch(approveLeave(leaveId));
  };

  const handleReject = (leaveId) => {
    dispatch(rejectLeave(leaveId));
  };

  let leaves = [];
  if (activeTab === "Pending") leaves = pendingLeaves;
  if (activeTab === "Approved") leaves = approvedLeaves;
  if (activeTab === "Rejected") leaves = rejectedLeaves;

  return (
    <div className="manager-dashboard-container">
      <div className="manager-dashboard-tabs">
        <button
          className={`manager-dashboard-tab${activeTab === "Pending" ? " active" : ""}`}
          onClick={() => setActiveTab("Pending")}
        >
          Pending Leaves
        </button>
        <button
          className={`manager-dashboard-tab approved${activeTab === "Approved" ? " active" : ""}`}
          onClick={() => setActiveTab("Approved")}
        >
          Approved Leaves
        </button>
        <button
          className={`manager-dashboard-tab rejected${activeTab === "Rejected" ? " active" : ""}`}
          onClick={() => setActiveTab("Rejected")}
        >
          Rejected Leaves
        </button>
      </div>

      {status === "loading" && <p>Loading leave requests...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}
      {Array.isArray(leaves) && leaves.length === 0 && status === "succeeded" && (
        <p className="text-gray-500 text-center">No {activeTab} leave requests.</p>
      )}

      <div>
        {Array.isArray(leaves) && leaves.map((leave) => (
          <div
            key={leave._id}
            className="manager-leave-card"
          >
            <div className="manager-leave-details">
              <p><strong>Employee:</strong> {leave.userId?.name || "Unknown"}</p>
              <p><strong>Leave Type:</strong> {leave.leaveType}</p>
              <p><strong>Start Date:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(leave.endDate).toLocaleDateString()}</p>
              <p><strong>Total Days:</strong> {leave.leaveDays}</p>
              <p><strong>Status:</strong> {leave.status}</p>
            </div>
            {activeTab === "Pending" && (
              <div className="manager-leave-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(leave._id)}
                >
                  Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(leave._id)}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerDashboard;
