import { configureStore} from "@reduxjs/toolkit";
import logger from 'redux-logger'
import user from "./userStore";
import thunk from 'redux-thunk';
import following from "./followStore";
import profile from "./profileStore";
export default configureStore({
  reducer: {
    user,
    following,
    profile,
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
