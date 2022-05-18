import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
import { Badge } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowing } from '../store/followStore';

const Header = (props) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const { account } = props;

  useEffect(() => {
    user && user.data && dispatch(getFollowing(user));
  }, [user, dispatch]);

  return (
    <div>
      <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img
                alt=""
                src="./images/logo2.jpg"
                width="50"
                height="50"
                className="d-inline-block align-center"
              />{' '}
              Ink Buzz
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto">
              {!!account ? (
                <Badge
                  colorScheme="green"
                  alignItems="center"
                  justifyContent="center"
                  alignSelf="center">
                  Wallet Connected
                </Badge>
              ) : (
                ''
              )}
              {user && user.data ? (
                <>
                  <LinkContainer to="/">
                    <Nav.Link>Home</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/upLoad">
                    <Nav.Link>Upload Image</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/profile">
                    <Nav.Link>My Profile</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/Chat">
                    <Nav.Link>Chat</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/Logout">
                    <Nav.Link>Logout</Nav.Link>
                  </LinkContainer>
                </>
              ) : (
                <>
                  <LinkContainer to="/SignIn">
                    <Nav.Link>Log In</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/SignUp">
                    <Nav.Link>Sign Up</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
