import { doc, getDoc, query, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getProfile = createAsyncThunk(
  "profile/getProfileStatus",
  async (searchPara, thunkAPI) => {
    const {profileId, search} = searchPara
    let userRef = await doc(db, "users", profileId);
    let getProfile = await getDoc(userRef);
    console.log(search)
    if(search === 'artist') {
      const {following, followers, name, data, profilePic, images} = await getProfile.data()
      let profileInfo =  {following, followers, name, data, profilePic, images}
      console.log('its here')
      return profileInfo
    }

  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfileStatus",
  async (profileData, thunkAPI) => {
    try {

      const { artistProfile, update } = profileData;

      let artistProf = await doc(db, "users", `${artistProfile.data.id}`);
      await updateDoc(artistProf, update);

      let profRef = await doc(db, "users", artistProfile.data.id);
      let getProf = await getDoc(profRef);
      let {following, followers, name, data, profilePic, images } = await getProf.data();
      const artistInfo = {following, followers, name, data, profilePic, images }

      return artistInfo;
    } catch (err) {
      console.log(err);
    }
  }
);

export const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: {},
    loading: "idle",
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.profile = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        if (state.loading === "idle") {
          state.loading = "pending";
        }
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        if (state.loading === "pending") {
          state.loading = "idle";
          state.profile = action.payload;
          state.error = null;
        }
      })
      .addCase(getProfile.rejected, (state, action) => {
        if (state.loading === "pending") {
          state.loading = "idle";
          state.error = action.error;
        }
      })
      .addCase(updateProfile.pending, (state) => {
        if (state.loading === "idle") {
          state.loading = "pending";
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.loading === "pending") {
          state.loading = "idle";
          state.profile = action.payload;
          state.error = null;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        if (state.loading === "pending") {
          state.loading = "idle";
          state.error = action.error;
        }
      });
  },
});

export const { clearProfile } = profileSlice.actions;

export default profileSlice.reducer;
