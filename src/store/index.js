import { configureStore } from '@reduxjs/toolkit';
import user from './userStore';


export default configureStore({
reducer: {
  user
},
});

