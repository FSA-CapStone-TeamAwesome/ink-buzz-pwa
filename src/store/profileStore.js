import { doc, getDoc, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';



export const getProfile = createAsyncThunk(
  'profile/getProfileStatus',
  async (profile, thunkAPI) => {
    let userRef = await doc(db, 'users', profile.id);
    let getProfile = await getDoc(userRef);
    let profileInfo = await getProfile.data();
    query()

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


export default profileSlice.reducer







