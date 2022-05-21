import {
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  inMemoryPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
} from 'firebase/auth';
import { toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';

export function setLocal(email, password) {
  injectStyle();
  const auth = getAuth();
  setPersistence(auth, indexedDBLocalPersistence)
    .then(() => {
      // In memory persistence will be applied to the signed in Google user
      // even though the persistence was set to 'none' and a page redirect
      // occurred.
      return signInWithEmailAndPassword(auth, email, password);
    })
    .catch((error) => {
      // Handle Errors here.
      toast.error('Incorrect username and password');
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}
