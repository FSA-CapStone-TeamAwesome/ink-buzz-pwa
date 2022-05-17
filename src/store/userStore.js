import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { db, storage } from '../config/firebase';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getUser = createAsyncThunk(
  'user/getUserStatus',
  async (user, thunkAPI) => {
    let userRef = await doc(db, 'users', user.auth.currentUser.uid);
    let getUser = await getDoc(userRef);
    let userInfo = await getUser.data();
    return userInfo;
  },
);

export const updateUser = createAsyncThunk(
  'user/updateUserStatus',
  async (userData, thunkAPI) => {
    const { user, update } = userData;
    console.log(user);
    console.log(update);
    let userProf = await doc(db, 'users', `${user.data.id}`);
    await updateDoc(userProf, update);

    let userRef = await doc(db, 'users', user.data.id);
    let getUser = await getDoc(userRef);
    let userInfo = await getUser.data();

    return userInfo;
  },
);
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {},
    loading: 'idle',
    error: null,
  },
  reducers: {
    signOutState: (state) => {
      state.user = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        if (state.loading === 'idle') {
          state.loading = 'pending';
        }
      })
      .addCase(getUser.fulfilled, (state, action) => {
        if (state.loading === 'pending') {
          state.loading = 'idle';
          state.user = action.payload;
          state.error = null;
        }
      })
      .addCase(getUser.rejected, (state, action) => {
        if (state.loading === 'pending') {
          state.loading = 'idle';
          state.error = action.error;
        }
      })
      .addCase(updateUser.pending, (state) => {
        if (state.loading === 'idle') {
          state.loading = 'pending';
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        if (state.loading === 'pending') {
          state.loading = 'idle';
          state.user = action.payload;
          state.error = null;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        if (state.loading === 'pending') {
          state.loading = 'idle';
          state.error = action.error;
        }
      });
  },
});

export const { signOutState } = userSlice.actions;

export default userSlice.reducer;
