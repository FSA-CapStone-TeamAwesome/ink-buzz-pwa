import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Tab, Row, Col, Nav } from 'react-bootstrap';
import { assets } from '../constants';
import { toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';

const Profile = () => {
  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(!show);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    injectStyle();
    toast.success('Profile Updated!');

    setShow(!show);
  };

  useEffect(() => {}, [show]);

  return (
    <Container className="mt-3">
      <h1>My Profile</h1>
      <div className="d-flex align-items-center">
        <div className="d-flex flex-column align-items-center">
          <img src={assets.person01} alt="person" />
        </div>
        <div className="ms-3">
          <h3>Name: Alec Eiber</h3>
          <h3>Email: alec@alec.com</h3>
        </div>
      </div>
      <div className="mt-1 mx-auto">
        {!show ? (
          <Button
            variant="secondary"
            onClick={handleShow}
            disabled={show === true}>
            Edit Profile
          </Button>
        ) : (
          <div></div>
        )}
      </div>

      {show ? (
        <div className="mt-3">
          <h3>Profile Settings:</h3>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Updated Name:</Form.Label>
              <Form.Control type="text" placeholder="Enter Name" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Updated Email address:</Form.Label>
              <Form.Control type="email" placeholder="Enter email" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Updated Password:</Form.Label>
              <Form.Control type="password" placeholder="Enter Password" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="profile-image">
              <Form.Label>Updated Profile Picture:</Form.Label>
              <Form.Control type="file" />
            </Form.Group>

            <Button type="submit">Save Changes</Button>
          </Form>
        </div>
      ) : (
        <div></div>
      )}

      <div className="mt-3">
        <Tab.Container id="left-tabs-example" defaultActiveKey="feed">
          <Row>
            <Col sm={3} className="mb-3">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="feed">Main Feed</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="followers">17 Followers</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="following">28 Following</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="favorites">42 Favorites</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey="feed">
                  <h3>Here's your feed</h3>
                </Tab.Pane>
                <Tab.Pane eventKey="followers">
                  <h3>You have 17 Followers</h3>
                </Tab.Pane>
                <Tab.Pane eventKey="following">
                  <h3>You are following 28 artists</h3>
                </Tab.Pane>
                <Tab.Pane eventKey="favorites">
                  <h3>You have 42 favorites</h3>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>

        {/* <Tabs defaultActiveKey="feed" id="feed" className="mb-3">
          <Tab eventKey="feed" title="Main Feed">
            <h3>Here's your feed</h3>
          </Tab>
          <Tab eventKey="followers" title="Followers">
            <h3>You have 17 Followers</h3>
          </Tab>
          <Tab eventKey="following" title="Following">
            <h3>You are following 28 artists</h3>
          </Tab>
          <Tab eventKey="favorites" title="Favorites">
            <h3>You have 19 favorites</h3>
          </Tab>
        </Tabs> */}
      </div>
    </Container>
  );
};

export default Profile;
