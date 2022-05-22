import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth, storage } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { setLocal } from '../config/Auth';
import { useSelector, useDispatch } from 'react-redux';
import { Heading } from '@chakra-ui/react';
import { ref, uploadString } from 'firebase/storage';
import defaultImg from '../assets/images/default-profile.jpeg';
import { getUser } from '../store/userStore';

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);

  const [uploaded, setUploaded] = useState(false);
  const [value, setValue] = useState({
    email: '',
    password: '',
    name: '',
    error: '',
  });

  const signUp = async (evt) => {
    evt.preventDefault();
    setUploaded(!uploaded);
    if (value.email === '' || value.password === '' || value.name === '') {
      setValue({
        ...value,
        error: 'Name, email, and password are mandatory.',
      });
      setUploaded(!uploaded);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, value.email, value.password);
      let date = Date.now();
      let newUserDoc = await doc(db, `users`, `${auth.currentUser.uid}`);
      //doc will make an new User doc for us in the users collection, and the name will be the user.uid

      const imageRef = ref(
        storage,
        `images/universal/${auth.currentUser.uid}/profile-picture`,
      );
      await uploadString(imageRef, defaultImg, 'data_url');

      await setDoc(newUserDoc, {
        name: value.name,
        profilePic: `/images/universal/${auth.currentUser.uid}/profile-picture`,
        data: {
          email: value.email,
          location: '',
          id: auth.currentUser.uid,
        },
        images: [],
        chatsWith: [],
        followers: [],
        following: [],
        accounts: {},
        created: `${date}`,
      });
      //User information will be display name, profileImage
      //data stored as an object containing the email, location, followers and following
      //photo collection
      //pay account information

      if (auth.currentUser) {
        setLocal(value.email, value.password);
        window.localStorage.setItem('token', auth.currentUser.accessToken);
        dispatch(getUser(auth.currentUser));
        navigate('/');
      }
    } catch (error) {
      setValue({
        ...value,
        error: error.message,
      });
      setUploaded(!uploaded);
    }
  };
  useEffect(() => {
    if (user && user.data) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div style={{ marginTop: '5rem' }}>
      {!!value.error && <div className="error">{value.error}</div>}
      <div className="d-flex flex-column justify-content-center align-items-center">
        <Heading className="mb-5">Sign Up</Heading>
        <Form className="controls w-50" onSubmit={signUp}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Control
              placeholder="Name"
              type="text"
              value={value.name}
              onChange={(evt) => {
                setValue({ ...value, name: evt.target.value });
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Control
              placeholder="Email"
              type="email"
              value={value.email}
              onChange={(evt) => {
                setValue({ ...value, email: evt.target.value });
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Control
              placeholder="Password"
              value={value.password}
              type="password"
              onChange={(evt) =>
                setValue({ ...value, password: evt.target.value })
              }
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={uploaded}>
            Submit
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default SignUp;
