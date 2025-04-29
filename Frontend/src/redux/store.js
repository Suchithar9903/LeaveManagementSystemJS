import { configureStore } from "@reduxjs/toolkit";
import leaveReducer from "./leaveSlice.js";
import userReducer from "./UserSlice.js";
import notificationReduder from "./notificationSlice.js";
import managerReducer from "./managerSlice.js";

const store = configureStore({
    reducer:{
        leave : leaveReducer,
        user : userReducer,
        notifications: notificationReduder,
        manager: managerReducer
    },
});

export default store;