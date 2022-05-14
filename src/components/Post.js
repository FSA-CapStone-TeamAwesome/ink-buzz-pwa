import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../config/firebase';


const Post = ({ data }) => {
  const [photo, setPhoto] = useState(null)
  const { id, name, creator, price, description, image } = data;


  async function getPhoto () {
    let getIt = await getDownloadURL(ref(storage, image))
    setPhoto(getIt)
  }
  useEffect(()=> {
    getPhoto()
  }, [])


  return (
    <Container className="mb-3">
      <Card style={{ width: '18rem' }}>
        <Card.Img variant="top" src={photo} className="NFTimage" />
        <Card.Body className="text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{creator}</Card.Subtitle>
          <Card.Subtitle className="mb-2 text-muted">${price}</Card.Subtitle>
          <Card.Text>{description}</Card.Text>
          <Link to={`nft/${id}`}>
            <Button variant="primary">Get Details</Button>
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Post;
