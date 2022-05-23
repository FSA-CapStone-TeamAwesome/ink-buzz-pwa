import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from 'react-bootstrap';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const FollowCard = ({ profilePic, id, name }) => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const user = useSelector((state) => state.user.user);

  const getPhoto = useCallback(async () => {
    let getIt = await getDownloadURL(ref(storage, profilePic));
    setPhoto(getIt);
  }, [profilePic]);

  useEffect(() => {
    getPhoto();
  }, [getPhoto]);

  const artistProfileFunc = (inputtedCreatorId) => {
    if (user && user.data && user.data.id === inputtedCreatorId) {
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
          <Card.Title>{name}</Card.Title>
          <Button variant="dark" onClick={() => artistProfileFunc(id)}>
            Go to profile
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FollowCard;
