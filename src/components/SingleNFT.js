import React from 'react';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import ListGroup from 'react-bootstrap/ListGroup';
import { useParams } from 'react-router-dom';

import { NFTData } from '../constants';

const SingleNFT = () => {
  let { nftId } = useParams();
  const data = NFTData.find((nft) => nft.id === nftId);
  const { id, name, creator, price, description, image, bids } = data;

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <h1>{name}</h1>
      <h4>Created by {creator}</h4>
      <Image fluid src={image} />
      <h5 className="mt-3">${price}</h5>
      <p>{description}</p>
      <Button>Message Artist</Button>
      <h5 className="mt-3">Current Bids</h5>
      <ListGroup className="my-2">
        {bids
          .sort((a, b) => b.price - a.price)
          .map((bid) => {
            return (
              <ListGroup.Item key={bid.id} className="text-center">
                <div>On {bid.date}</div>
                <div>
                  {bid.name} bid ${bid.price.toFixed(2)}
                </div>
              </ListGroup.Item>
            );
          })}
      </ListGroup>
    </Container>
  );
};

export default SingleNFT;
