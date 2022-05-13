import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const Logout = () => {
  window.localStorage.removeItem('token');
  signOut(auth);
  const navigate = useNavigate();
  navigate('/');

  return <div>Logout</div>;
};

export default Logout;
