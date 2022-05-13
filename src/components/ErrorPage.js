import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';

const ErrorPage = () => {
  return (
    <Container className="d-flex flex-column flex-wrap justify-content-center align-items-center">
      <h1>Page Not Found</h1>
      <Link to="/" className="mb-3">
        <h3>Click here to return to the Home Page</h3>
      </Link>
    </Container>
  );
};

export default ErrorPage;
