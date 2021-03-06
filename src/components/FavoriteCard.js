import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button } from 'react-bootstrap';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { Link } from 'react-router-dom';

const FavoriteCard = ({ favorite }) => {
  const [photo, setPhoto] = useState(null);

  const getPhoto = useCallback(async () => {
    let getIt = await getDownloadURL(ref(storage, favorite.photo));
    setPhoto(getIt);
  }, [favorite]);

  useEffect(() => {
    getPhoto();
  }, [getPhoto]);

  return (
    <div>
      <Card style={{ width: '18rem' }}>
        <Card.Img variant="top" src={photo} />
        <Card.Body>
          <Card.Title>{favorite.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Created By: {favorite.creator}
          </Card.Subtitle>
          <Button variant="dark">
            <Link to={`/nft/${favorite.id}`} className="mt-3">
              Go to design
            </Link>
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FavoriteCard;
