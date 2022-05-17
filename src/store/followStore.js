import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where

} from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const getFollowing = createAsyncThunk(
  'followers/getFollower',
  async (user, thunkAPI) => {
    let artistArr = []
    if(user === {}){return}
    user.following.forEach( async (coolDude) => {
      let artist = {}
      let docs = query(collection(db, 'users'), where('data.email', '==', `${coolDude}`))
      await onSnapshot(docs, async (snap) => {
      snap.forEach((doc) => {
        let quick = doc.data()
         artist= {
          name: quick.name,
          email: quick.data.email,
          links: []
        }})

      let userRef=  query(collection(db, 'NFTs'), orderBy('created', 'desc'), where('creator', '==', `${coolDude}`), limit(3))
      await onSnapshot(userRef, (snap) => {
        snap.forEach((doc) => artist.links.push(doc.data()))
      })
      // console.log(artist)
      // artistArr.push(artist)
    })
    // artists.push(artist)

  })
  return artistArr
})

export const followingSlice = createSlice({
  name: 'following',
  initialState: {
    following: [],
    loading: 'idle',
    error: null
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
    }
    })
    .addCase(getFollowing.rejected, (state, action) => {
    if (state.loading === 'pending') {
    state.loading = 'idle';
    state.error = action.error;
    }
    })
  }})



  export default followingSlice.reducer
