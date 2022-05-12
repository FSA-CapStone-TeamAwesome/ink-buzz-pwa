import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
 apiKey,
 authDomain,
 projectId,
 storageBucket,
 messagingSenderId,
 appId,
 measurementId,
} from '../secrets';

const firebaseConfig = {
 apiKey,
 authDomain,
 projectId,
 storageBucket,
 messagingSenderId,
 appId,
 measurementId,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
