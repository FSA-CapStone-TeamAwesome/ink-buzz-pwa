import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, storage } from "../config/firebase";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getFollowing = createAsyncThunk(
  "followers/getFollower",
  async (user, thunkAPI) => {
    if (user === {}) {
      return;
    }
    let artistArr = [];

    //  let promiseReturn = await Promise.all(user.following.map(async (coolDude) => {
    await Promise.all(
      user.following.map(async (coolDude) => {
        let docRef = await doc(db, "users", `${coolDude.id}`);
        let getArtist = await getDoc(docRef);
        let artistInfo = await getArtist.data();
        artistArr.push(artistInfo);
      })
    ).then(() => {
      return artistArr;
    });
    // .then(async () =>
    // await artistArr.map(async (coolDude) => {
    //   let artRef = await query(collection(db, 'NFTs'), where('creator', '==', `${coolDude.data.id}`), limit(3))
    //   await onSnapshot(artRef, (snap) => {
    //     snap.forEach(async (doc) => {
    //       let data = await doc.data()
    //       coolDude.list = [...coolDude.list, data]
    //     })
    //       console.log(coolDude)
    //   })
    // }))

    return artistArr;
  }
);

export const followingSlice = createSlice({
  name: "following",
  initialState: {
    following: [],
    loading: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFollowing.pending, (state) => {
        if (state.loading === "idle") {
          state.loading = "pending";
        }
      })
      .addCase(getFollowing.fulfilled, (state, action) => {
        if (state.loading === "pending") {
          state.loading = "idle";
          state.following = action.payload;
          state.error = null;
        }
      })
      .addCase(getFollowing.rejected, (state, action) => {
        if (state.loading === "pending") {
          state.loading = "idle";
          state.error = action.error;

        }
      });
  },
});

export default followingSlice.reducer;
