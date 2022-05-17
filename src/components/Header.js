import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
import { useDispatch, useSelector } from 'react-redux';

import { getFollowing } from '../store/followStore';
const Header = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    user.data && dispatch(getFollowing(user));
  }, [user, dispatch]);

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
              {user.data ? (
                <>
                  <LinkContainer to="/Logout">
                    <Nav.Link>Logout</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/upLoad">
                    <Nav.Link>Upload Image</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/profile">
                    <Nav.Link>My Profile</Nav.Link>
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
              <LinkContainer to="/Chat">
                <Nav.Link>Chat</Nav.Link>
              </LinkContainer>
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

// function mapDispatchToProps (dispatch) {
//   return {
//     fetchUser: () => dispatch(fetchUserThunk())
//   }
// }

// export default connect(null, mapDispatchToProps)(Header)
export default Header;
