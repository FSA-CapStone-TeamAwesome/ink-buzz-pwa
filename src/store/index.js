import { configureStore } from '@reduxjs/toolkit';
import user from './userStore';
import following from './followStore'
import profile from './profileStore'
export default configureStore({
reducer: {
  user,
  following,
  profile
},
});

