// src/redux/managerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../axios.js';

// Fetch all pending leaves
export const fetchPendingLeaves = createAsyncThunk(
  'manager/fetchPendingLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/leaves/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch leaves');
    }
  }
);

// Approve leave
export const approveLeave = createAsyncThunk(
  'manager/approveLeave',
  async (leaveId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.put(`/leaves/${leaveId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.leave;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to approve leave');
    }
  }
);

export const fetchApprovedLeaves = createAsyncThunk(
    'manager/fetchApprovedLeaves',
    async (_, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const response = await API .get('/leaves/approved', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.error || 'Failed to fetch leaves');
      }
    }
  );

// Reject leave
export const rejectLeave = createAsyncThunk(
  'manager/rejectLeave',
  async (leaveId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.put(`/leaves/${leaveId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.leave;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to reject leave');
    }
  }
);

export const fetchRejectedLeaves = createAsyncThunk(
    'manager/fetchRejectedLeaves',
    async (_, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get('/leaves/rejected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.error || 'Failed to fetch leaves');
      }
    }
);

const managerSlice = createSlice({
  name: 'manager',
  initialState: {
    pendingLeaves: [],
    approvedLeaves: [],
    rejectedLeaves: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingLeaves.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPendingLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingLeaves = action.payload;
      })
      .addCase(fetchPendingLeaves.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchApprovedLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.approvedLeaves = action.payload;
      })
      .addCase(fetchRejectedLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.rejectedLeaves = action.payload;
      })
      .addCase(approveLeave.fulfilled, (state, action) => {
        state.pendingLeaves = state.pendingLeaves.filter(
          (leave) => leave._id !== action.payload._id
        );
        state.approvedLeaves = [action.payload, ...state.approvedLeaves];
      })
      .addCase(rejectLeave.fulfilled, (state, action) => {
        state.pendingLeaves = state.pendingLeaves.filter(
          (leave) => leave._id !== action.payload._id
        );
        state.rejectedLeaves = [action.payload, ...state.rejectedLeaves];
      });
  },
});

export default managerSlice.reducer;