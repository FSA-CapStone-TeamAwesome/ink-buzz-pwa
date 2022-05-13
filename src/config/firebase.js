// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';



import {
  apiKey,
  authDomain,
  projectId,
  databaseURL,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
} from '../secrets';

const firebaseConfig = {
  apiKey,
  authDomain,
  databaseURL,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
};

// Initialize Firebase
function startUpDB (){
  initializeApp(firebaseConfig)
}
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const startAuth = getAuth(app)
export const auth = getAuth()




export default app;
