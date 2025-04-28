import { configureStore } from "@reduxjs/toolkit";
import galleryReducer from "./gallerySlice.js";
import userReducer from "./UserSlice.js";
import notificationReduder from "./notificationSlice.js";

const store = configureStore({
    reducer:{
        gallery : galleryReducer,
        user : userReducer,
        notifications: notificationReduder
    },
});

export default store;