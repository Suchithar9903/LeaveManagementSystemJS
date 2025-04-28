import { createSlice } from "@reduxjs/toolkit";
import API from "../axios.js";

const notificationSlice = createSlice({
    name: "notifications",
    initialState: { list: [], loading: false, error: null },
    reducers: {
        fetchNotificationsStart: (state) => { state.loading = true; },
        fetchNotificationsSuccess: (state, action) => {
            state.loading = false;
            state.list = action.payload;
        },
        fetchNotificationsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        markAsReadSuccess: (state, action) => {
            state.list = state.list.map((notif) => 
                notif._id === action.payload ? { ...notif, isRead: true } : notif
            );
        },
    },
});

export const {
    fetchNotificationsStart,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
    markAsReadSuccess,
} = notificationSlice.actions;

export default notificationSlice.reducer;

export const fetchNotifications = () => async (dispatch) => {
    dispatch(fetchNotificationsStart());
    try {
        const response = await API.get("/notifications");
        dispatch(fetchNotificationsSuccess(response.data));
    } catch (error) {
        dispatch(fetchNotificationsFailure("Failed to fetch notifications"));
    }
};

export const markNotificationAsRead = (id) => async (dispatch) => {
    try {
        await API.put(`/notifications/${id}/read`);
        dispatch(markAsReadSuccess(id));
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};