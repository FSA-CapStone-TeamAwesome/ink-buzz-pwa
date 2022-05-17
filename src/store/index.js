import { configureStore } from '@reduxjs/toolkit';
import user from './userStore';
import following from './followStore'

export default configureStore({
reducer: {
  user,
  following
},
});

