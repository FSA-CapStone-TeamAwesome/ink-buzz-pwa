import React, { useEffect, useState, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../config/firebase';

const PreviewPost = ({ data, creator }) => {
  const [photo, setPhoto] = useState(null);
  const { id, name, smallPath } = data;

  const getPhoto = useCallback(async () => {
    let getIt = await getDownloadURL(ref(storage, smallPath));
    setPhoto(getIt);
  }, [smallPath]);

  useEffect(() => {
    getPhoto();
  }, [getPhoto]);

  return (
    <div className="mb-2 mobilePost">
      <Card style={{ width: '18rem' }}>
        <Card.Img variant="top" src={photo} />
        <Card.Body className="text-center">
          <Card.Title>{name}</Card.Title>
          <Link to={`/nft/${id}`}>
            <Button variant="primary">Get Details</Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PreviewPost;
