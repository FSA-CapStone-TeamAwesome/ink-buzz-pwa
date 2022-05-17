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

// export const getFollowing = createAsyncThunk(
//   'followers/getFollower',
//   async (user, thunkAPI) => {
//     let artistArr = []
//     console.log(user)
//     if(user === {}){return}
//    await user.following.map( async (coolDude) => {
//       let artist = {}
//       let docs = await query(collection(db, 'users'), where('data.email', '==', `${coolDude}`))
//       await onSnapshot(docs, (snap) => {
//       snap.forEach(async (doc) => {
//         let quick = await doc.data()
//          artist= {
//           name: quick.name,
//           email: quick.data.email,
//           links: []
//         }})})
//         console.log(artist)
//         if(artist.email){
//       let userRef=  await query(collection(db, 'NFTs'), orderBy('created', 'desc'), where('creator', '==', `${coolDude}`), limit(3))
//       await onSnapshot(userRef, async (snap) => {
//         snap.forEach(async (doc) => {
//           let link = await doc.data()
//           artist.links = [...link]
//         })
//       })}
//       console.log(artist)
//       artistArr.push(artist)
//     })
//     // artists.push(artist)

//   console.log(artistArr)
//   return artistArr
// })

export const getFollowing = createAsyncThunk(
  'followers/getFollower',
  async (user, thunkAPI) => {
    let artistArr = []

    // if(user === {}){return}

    const artistCol =  collection(db, 'users')
    const nftCol =  collection(db, 'NFTs')


    const getArtists = async (coolDude) => {
       let artist = {}
        const docs =  query(artistCol, where('data.email', '==', `${coolDude}`))
        await onSnapshot(docs, (snap) => {
          snap.forEach(async(doc) => {
          let quick =  await doc.data()
          console.log(quick)
            artist= {
            name: quick.name,
            email: quick.data.email,
            links: []
          }})
      artistArr = (prev) => [...prev, artist]
    })}
    user.following.map(async (coolDude) => {
      getArtists(coolDude)
    })
    return artistArr
  //   user.following.forEach(async (guy) => { await artistArr.push(getArtists(guy))})
  //  await getArtists()
  //   console.log(artistArr)
  //   const fetchDesigns = async (artist) => {
  //     const userRef= query(nftCol, where('creator', '==', `${artist.email}`), orderBy('created', 'desc'), limit(3))
  //     await onSnapshot(userRef, async (snap) => {
  //     await snap.forEach((doc) => artist.links.push(doc.data()))
  //    })
  //   }
  //   artistArr.forEach((artist) => fetchDesigns(artist))
  //   console.log(artistArr)
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
