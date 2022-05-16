import React from 'react';
import { Button, Container, Tab, Tabs } from 'react-bootstrap';
import { assets } from '../constants';

const Profile = () => {
  return (
    <Container className="mt-3">
      <h1>My Profile</h1>
      <div className="d-flex align-items-center">
        <img src={assets.person01} alt="person" />
        <div className="ms-3">
          <h3>Name: Alec Eiber</h3>
          <h3>Email: alec@alec.com</h3>
        </div>
      </div>
      <div className="mt-3">
        <Tabs defaultActiveKey="feed" id="feed" className="mb-3">
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
        </Tabs>
      </div>
    </Container>
  );
};

export default Profile;
