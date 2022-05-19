import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../config/firebase';

const Post = ({ data }) => {
  const [photo, setPhoto] = useState(null);
  const { id, name, creator, price, description, image } = data;

  async function getPhoto() {
    let getIt = await getDownloadURL(ref(storage, image));
    setPhoto(getIt);
  }
  useEffect(() => {
    getPhoto();
  }, []);

  if (data.tags.includes('')) return;

  return (
    <div className="mb-3 me-5">
      <Card style={{ width: '300px' }}>
        <Card.Img variant="top" src={photo} className="NFTimage" />
        <Card.Body className="text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{creator}</Card.Subtitle>
          <Card.Subtitle className="mb-2 text-muted">
            ${(price / 100).toFixed(2)}
          </Card.Subtitle>
          <Card.Text>{description}</Card.Text>
          <Link to={`nft/${id}`}>
            <Button variant="primary">Get Details</Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Post;
