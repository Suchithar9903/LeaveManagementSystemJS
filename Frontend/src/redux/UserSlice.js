import API from "../axios.js";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUserProfile = createAsyncThunk(
    "user/fetchUserProfile",
    async (_, { rejectWithValue }) => {
        try {
          const token = localStorage.getItem("token"); 
          const res = await API.get("/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
        } catch (error) {
          return rejectWithValue(error.response.data);
        }
      }
);

export const updateUserProfile = createAsyncThunk(
    "user/updateUserProfile",
    async(profileData, {rejectWithValue}) => {
        try{
            const token = localStorage.getItem("token");
            const res = await API.put("/users/profile",profileData,{
                headers : {Authorization : `Bearer ${token}`}
            });
            return res.data;
        }catch(error){
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchUserLikedArtworks = createAsyncThunk(
    "user/fetchUserLikedArtworks",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await API.get("/users/profile/liked-artworks", {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchUserComments = createAsyncThunk(
    "user/fetchUserComments",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await API.get("/users/profile/comments", {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);
export const fetchUserUploadedArtworks = createAsyncThunk(
    "user/fetchUserUploadedArtworks",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const res = await API.get("/users/profile/uploaded-artworks", {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);
const userSlice = createSlice({
    name:"user",
    initialState:{
        user: null,
        likedArtworks: [],
        uploadedArtworks: [],
        comments: [],
        status:"idle",
        error:null
    },
    reducers:{
        logoutUser: (state) => {
            state.user = null;
            localStorage.removeItem("token");
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchUserProfile.pending, (state) => {
            state.status = "loading";
        })
        .addCase(fetchUserProfile.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.user = action.payload;
        })
        .addCase(fetchUserProfile.rejected, (state, action ) => {
            state.status = "failed";
            state.error = action.payload;
        })
        .addCase(updateUserProfile.fulfilled, (state, action) => {
            state.user = action.payload.user;
        })
        .addCase(fetchUserLikedArtworks.fulfilled, (state, action) => {
            state.likedArtworks = action.payload;
        })
        .addCase(fetchUserUploadedArtworks.fulfilled, (state, action) => {
            state.uploadedArtworks = action.payload;
        })
        .addCase(fetchUserComments.fulfilled, (state, action) => {
            state.comments = action.payload;
        })
    }
});

export const {logoutUser} = userSlice.actions;
export default userSlice.reducer;