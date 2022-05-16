import { doc,  getDoc, updateDoc} from "firebase/firestore"
// import { useAuthentication } from '../hooks/useAuthentication';
import { db, storage } from '../config/firebase';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';



// async function CallIt () {
//   const { user } = await useAuthentication();
//   return user
// }

export const getUser = createAsyncThunk(
  'user/getUserStatus',
  async (user, thunkAPI) => {

    let userRef = await doc(db, 'users', user.auth.currentUser.uid);
    let getUser = await getDoc(userRef);
    let userInfo = await getUser.data();
    return userInfo;
  }
)

export const updateUser = createAsyncThunk(
  'user/updateUserStatus',
  async (userData, thunkAPI) => {
    const {user, update} = userData
    console.log(user)
    console.log(update)
    let userProf = await doc(db, 'users', `${user.data.id}`)
    await updateDoc(userProf, update)

    let userRef = await doc(db, 'users', user.data.id);
    let getUser = await getDoc(userRef);
    let userInfo = await getUser.data();

    return userInfo;
  }
)
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {},
    loading: 'idle',
    error: null,
  },
  reducers: {},
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
    }
    })
    .addCase(updateUser.rejected, (state, action) => {
    if (state.loading === 'pending') {
    state.loading = 'idle';
    state.error = action.error;
    }
    });

  },
  })







  export default userSlice.reducer;

// export const fetchUser = (user) => {
//   return { type: FetchUser, user };
// };

// export const fetchUserThunk = (user) => {
//   return async function(dispatch) {
//     try {
//       let userRef = doc(db, 'users', user.auth.currentUser.uid)
//       let getUser = await getDoc(userRef)
//       let userInfo = await getUser.data()
//       dispatch(userInfo)
//     }
//     catch (err) {
//       console.log(err)
//     }
//   }
// }

// export default function userReducer(state = initialstate, action) {
//   switch (action.type) {
//     case FetchUser:
//       return action.user;
//     default:
//       return state;
//   }

// }
