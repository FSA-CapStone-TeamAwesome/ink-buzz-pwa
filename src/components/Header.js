import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
import { startAuth } from '../config/firebase';
import { auth } from '../config/firebase';
import { useAuthentication } from '../hooks/useAuthentication';

const Header = () => {
  const { user } = useAuthentication();
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // setIsLoggedIn(auth);

  // useEffect(() => {

  // }, []);
  console.log(user);

  return (
    <div>
      <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Ink Buzz</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto">
              {user && user.email ? (
                <LinkContainer to="/Logout">
                  <Nav.Link>Logout</Nav.Link>
                </LinkContainer>
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
              <LinkContainer to="/crypto">
                <Nav.Link>Wallet</Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
