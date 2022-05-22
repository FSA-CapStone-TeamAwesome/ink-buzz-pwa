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
      <Card style={{ width: '300px' }}>
        <Card.Img variant="top" src={photo} className="NFTimage" />
        <Card.Body className="text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{creator}</Card.Subtitle>
          <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
          <Link to={`/nft/${id}`}>
            <Button variant="primary">Get Details</Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PreviewPost;
