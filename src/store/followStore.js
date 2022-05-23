import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getFollowing = createAsyncThunk(
  'followers/getFollower',
  async (user, thunkAPI) => {
    if (user === {}) {
      return;
    }
    let artistArr = [];

    //  let promiseReturn = await Promise.all(user.following.map(async (coolDude) => {
    await Promise.all(
      user.following.map(async (coolDude) => {
        let docRef = await doc(db, 'users', `${coolDude.id}`);
        let getArtist = await getDoc(docRef);
        let artistInfo = await getArtist.data();
        artistArr.push(artistInfo);
      }),
    ).then(() => {
      return artistArr;
    });
    return artistArr;
  },
);

export const followingSlice = createSlice({
  name: 'following',
  initialState: {
    following: [],
    loading: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFollowing.pending, (state) => {
        if (state.loading === 'idle') {
          state.loading = 'pending';
        }
      })
      .addCase(getFollowing.fulfilled, (state, action) => {
        if (state.loading === 'pending') {
          state.loading = 'idle';
          state.following = action.payload;
          state.error = null;
        }
      })
      .addCase(getFollowing.rejected, (state, action) => {
        if (state.loading === 'pending') {
          state.loading = 'idle';
          state.error = action.error;
        }
      });
  },
});

export default followingSlice.reducer;
