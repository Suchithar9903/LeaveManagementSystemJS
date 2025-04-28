import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    artworks: [],
    loading: false,
    error: null,
};

const gallerySlice = createSlice({
    name: "gallery",
    initialState,
    reducers: {
        fetchArtworksStart: (state) => {
            state.loading = true;
        },
        fetchArtworksSuccess: (state, action) => {
            state.loading = false;
            state.artworks = action.payload;
        },
        fetchArtworksFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        likeArtworkSuccess: (state, action) => {
            const updatedArtwork = action.payload;
            state.artworks = state.artworks.map((art) =>
                art._id === updatedArtwork._id ? updatedArtwork : art
            );
        },
        commentArtworkSuccess: (state, action) => {
            const updatedArtwork = action.payload;
            state.artworks = state.artworks.map((art) =>
                art._id === updatedArtwork._id ? updatedArtwork : art
            );
        },
        approveArtworkSuccess: (state, action) => {
            state.artworks = state.artworks.filter((art) => art._id !== action.payload);
        },
        rejectArtworkSuccess: (state, action) => {
            state.artworks = state.artworks.filter((art) => art._id !== action.payload);
        },
    },
});

export const {
    fetchArtworksStart,
    fetchArtworksSuccess,
    fetchArtworksFailure,
    likeArtworkSuccess,
    commentArtworkSuccess,
    approveArtworkSuccess,
    rejectArtworkSuccess
} = gallerySlice.actions;

export default gallerySlice.reducer;