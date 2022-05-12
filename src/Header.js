import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import LinkContainer from 'react-router-bootstrap/LinkContainer';

const Header = () => (
  <div>
    <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Ink Buzz</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <LinkContainer to="/schedule">
              <Nav.Link>Create</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/standings">
              <Nav.Link>View All</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/results">
              <Nav.Link>Something else</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/register">
              <Nav.Link>Test</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  </div>
);

export default Header;
