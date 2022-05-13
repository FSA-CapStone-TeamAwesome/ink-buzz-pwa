import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  browserSessionPersistence,
  setPersistence,
  getAuth
} from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import {setLocal} from '../config/Auth';

const SignUp = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState({
    email: '',
    password: '',
    error: '',
  });

  async function signUp(evt) {
    evt.preventDefault();
    if (value.email === '' || value.password === '') {
      setValue({
        ...value,
        error: 'Email and password are mandatory.',
      });
      return;
    }

    try {

      await createUserWithEmailAndPassword(auth, value.email, value.password);

      let newUserDoc = await doc(db, `users`, `${auth.currentUser.uid}`);
      //doc will make an new User doc for us in the users collection, and the name will be the user.uid

      await setDoc(newUserDoc, {
        name: '',
        profileImage: '',
        data: {
          email: value.email,
          location: '',
        },
        photos: [],
        accounts: {},
      });
      //User information will be display name, profileImage
      //data stored as an object containing the email, location, followers and following
      //photo collection
      //pay account information


      if (auth.currentUser) {
        setLocal(value.email, value.password)
        window.localStorage.setItem('token', auth.currentUser.accessToken);
        navigate('/');
      }
    } catch (error) {
      setValue({
        ...value,
        error: error.message,
      });
    }
  }
  useEffect(() => {
    if (auth.currentUser) {

      navigate('/');
    }
  }, [navigate]);


  return (
    <div>
      <h1>Sign Up</h1>
      {!!value.error && <div className="error">{value.error}</div>}
      <form className="controls" onSubmit={signUp}>
        <input
          placeholder="Email"
          type="email"
          value={value.email}
          onChange={(evt) => {
            setValue({ ...value, email: evt.target.value });
          }}
        />
        <input
          placeholder="Password"
          value={value.password}
          type="password"
          onChange={(evt) => setValue({ ...value, password: evt.target.value })}
        />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default SignUp;
