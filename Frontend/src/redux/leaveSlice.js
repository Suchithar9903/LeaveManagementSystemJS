import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../axios.js"; // adjust path based on your project structure

// Thunk to apply for leave
export const applyLeave = createAsyncThunk(
  "leave/applyLeave",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.post("/leaves/apply", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to apply leave");
    }
  }
);

// Thunk to fetch user's leave status
export const fetchLeaveStatus = createAsyncThunk(
  "leave/fetchLeaveStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/leaves/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch leave status");
    }
  }
);

const leaveSlice = createSlice({
  name: "leave",
  initialState: {
    leaves: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearLeaveMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Apply Leave
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Leave applied successfully!";
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Leave Status
      .addCase(fetchLeaveStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
      })
      .addCase(fetchLeaveStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLeaveMessages } = leaveSlice.actions;

export default leaveSlice.reducer;
