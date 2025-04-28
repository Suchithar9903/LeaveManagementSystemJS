import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios.js";
import "../styles/app_style.css";
import "../styles/applyleave.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { applyLeave as applyLeaveAction } from "../redux/leaveSlice.js";

const ApplyLeave = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "casual",
    reason: "",
  });

  const [leaveDates, setLeaveDates] = useState([]);
  const [leaveDays, setLeaveDays] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Only calculate leave days when either startDate or endDate changes
    if (name === "startDate" || name === "endDate") {
      const { startDate, endDate } = { ...formData, [name]: value };
      if (startDate && endDate) {
        const { dates, count } = calculateLeaveDates(startDate, endDate);
        setLeaveDates(dates);
        setLeaveDays(count);
      }
    }
  };

  const calculateLeaveDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateList = [];
    let count = 0;

    // Loop through the dates, excluding weekends (Saturday & Sunday)
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) { // Exclude weekends (0 = Sunday, 6 = Saturday)
        dateList.push(new Date(d).toISOString().split("T")[0]); // Format date as yyyy-mm-dd
        count++;
      }
    }

    return { dates: dateList, count };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for missing required fields
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill all fields");
      return;
    }

    // Validation to ensure there are valid leave days (i.e., not only weekends)
    if (leaveDays === 0) {
      toast.warn("Selected dates include only weekends. Please select valid days.");
      return;
    }

    // Get the user ID from the local storage (assuming the token includes the user information)
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId"); // Make sure you're storing the user ID when the user logs in

    if (!userId) {
      toast.error("User ID is missing. Please log in again.");
      return;
    }

    // Prepare the payload for the leave request, including the user ID
    const payload = {
      ...formData,
      leaveDays,
      leaveDates,
      userId,  // Add userId to the payload
    };

    try {
      // Make the API request to submit the leave request
      const response = await API.post("http://localhost:5000/api/leaves/apply", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If API call is successful, dispatch action to update Redux store
      dispatch(applyLeaveAction(payload));

      toast.success("Leave request submitted successfully");
      setTimeout(() => navigate("/leave-status"), 1000); // Redirect to leave status page
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit leave request");
    }
  };

  return (
    <div className="apply-leave container mt-4">
      <h2 className="mb-4 text-center">Apply for Leave</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
        <div className="mb-3">
          <label className="form-label">Leave Type</label>
          <select name="leaveType" className="form-select" value={formData.leaveType} onChange={handleChange}>
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="earned">Earned</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            name="startDate"
            className="form-control"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            name="endDate"
            className="form-control"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Reason</label>
          <textarea
            name="reason"
            className="form-control"
            rows="3"
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>

        {leaveDays > 0 && (
          <div className="alert alert-info">
            <strong>Leave Days:</strong> {leaveDays}
            <br />
            <strong>Dates:</strong> {leaveDates.join(", ")}
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100">Submit Leave Application</button>
      </form>
    </div>
  );
};

export default ApplyLeave;
