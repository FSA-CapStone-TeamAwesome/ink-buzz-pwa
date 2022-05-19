import { doc, getDoc, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';




export const getProfile = createAsyncThunk(
  'profile/getProfileStatus',
  async (profileId, thunkAPI) => {
    let userRef = await doc(db, 'users', profileId);
    let getProfile = await getDoc(userRef);
    let profileInfo = await getProfile.data();
    console.log(profileInfo)
    return profileInfo

  },
)

export const profileSlice = createSlice({

  name: 'profile',
  initialState: {
    user: {},
    loading: 'idle',
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.profile ={}
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        if (state.loading === 'idle') {
          state.loading = 'pending';
        }
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        if (state.loading === 'pending') {
          state.loading = 'idle';
          state.profile = action.payload;
          state.error = null;
        }
      })
      .addCase(getProfile.rejected, (state, action) => {
        if (state.loading === 'pending') {
          state.loading = 'idle';
          state.error = action.error;
        }
      })

    }})

    export const {clearProfile} = profileSlice.actions

export default profileSlice.reducer








