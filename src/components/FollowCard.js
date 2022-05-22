import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from 'react-bootstrap';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { Link, useNavigate } from 'react-router-dom';

const FollowCard = ({ user }) => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);

  const getPhoto = useCallback(async () => {
    let getIt = await getDownloadURL(ref(storage, user.profilePic));
    setPhoto(getIt);
  }, [user]);

  useEffect(() => {
    getPhoto();
  }, [getPhoto]);

  const artistProfileFunc = (inputtedCreatorId) => {
    if (inputtedCreatorId === user.id) {
      navigate('/profile');
    } else {
      navigate(`/profiles/${inputtedCreatorId}`);
    }
  };

  return (
    <div>
      <Card style={{ width: '18rem' }}>
        <Card.Img variant="top" src={photo} />
        <Card.Body>
          <Card.Title>{user.name}</Card.Title>
          <Button variant="dark" onClick={() => artistProfileFunc(user.id)}>
            Go to profile
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FollowCard;
