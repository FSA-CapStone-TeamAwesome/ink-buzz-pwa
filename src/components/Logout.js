import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { signOutState } from '../store/userStore';
import { useDispatch } from 'react-redux';

const Logout = () => {
  const dispatch = useDispatch()
  window.localStorage.removeItem('token');
  signOut(auth);
  dispatch(signOutState())
  const navigate = useNavigate();
  navigate('/');

  return <div>Logout</div>;
};

export default Logout;
