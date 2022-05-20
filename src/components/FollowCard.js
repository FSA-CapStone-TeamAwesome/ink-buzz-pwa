import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { Link } from 'react-router-dom';

const FollowCard = ({ user }) => {
  const [photo, setPhoto] = useState(null);

  async function getPhoto() {
    let getIt = await getDownloadURL(ref(storage, user.profilePic));
    setPhoto(getIt);
  }
  useEffect(() => {
    getPhoto();
  }, []);

  return (
    <div>
      <Card style={{ width: '18rem' }}>
        <Card.Img variant="top" src={photo} />
        <Card.Body>
          <Card.Title>{user.name}</Card.Title>
          <Button variant="dark">
            <Link to={`/profiles/${user.id}`} className="mt-3">
              Go to profile
            </Link>
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FollowCard;
