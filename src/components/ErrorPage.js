import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { Heading } from '@chakra-ui/react';

const ErrorPage = () => {
  return (
    <Container className="d-flex flex-column flex-wrap justify-content-center align-items-center">
      <Heading mt={36} mb={10}>
        Page Not Found
      </Heading>
      <Link to="/" className="mb-3">
        <h3>Click here to return to the Home Page</h3>
      </Link>
    </Container>
  );
};

export default ErrorPage;
