import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { setLocal } from '../config/Auth';
import { useSelector } from 'react-redux';
import { Heading } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';

export const SignIn = () => {
  injectStyle();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const [value, setValue] = useState({
    email: '',
    password: '',
    error: '',
  });

  async function signIn(evt) {
    evt.preventDefault();
    if (value.email === '' || value.password === '') {
      toast.error('Email and password are mandatory');
      setValue({
        ...value,
        error: 'Email and password are mandatory.',
      });
      return;
    }

    try {
      setLocal(value.email, value.password);
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

  const demoAccount = () => {
    setLocal('demo@demo.com', 'demodemo');
  };

  return (
    <div style={{ marginTop: '5rem' }}>
      <div className="d-flex flex-column justify-content-center align-items-center">
        <Heading className="mb-5">Log In</Heading>
        <Form className="controls w-50 mobile-profile" onSubmit={signIn}>
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
          <Button variant="dark" type="submit" className="me-5 mb-3 w-100">
            Submit
          </Button>
          <Button
            variant="dark"
            onClick={() => demoAccount()}
            className="w-100">
            Sign in with a Demo account
          </Button>
        </Form>
      </div>
    </div>
  );
};
