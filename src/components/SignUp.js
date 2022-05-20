import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { setLocal } from '../config/Auth';
import { useSelector } from 'react-redux';

const SignUp = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const [value, setValue] = useState({
    email: '',
    password: '',
    name: '',
    error: '',
  });

  async function signUp(evt) {
    evt.preventDefault();
    if (value.email === '' || value.password === '' || value.name === '') {
      setValue({
        ...value,
        error: 'Name, email, and password are mandatory.',
      });
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, value.email, value.password);
      let date = Date.now();
      let newUserDoc = await doc(db, `users`, `${auth.currentUser.uid}`);
      //doc will make an new User doc for us in the users collection, and the name will be the user.uid

      await setDoc(newUserDoc, {
        name: value.name,
        profilePic: '/images/universal/default/default-profile',
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
    if (user && user.data) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div>
      {!!value.error && <div className="error">{value.error}</div>}
      <div className="d-flex flex-column justify-content-center align-items-center">
        <h1 className="mb-5">Sign Up</h1>
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
          <Button type="submit">Submit</Button>
        </Form>
      </div>
    </div>
  );
};

export default SignUp;
