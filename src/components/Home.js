import React from 'react';
import Container from 'react-bootstrap/Container';
import Post from './Post';

import { NFTData } from '../constants';

const Home = () => (
  <Container className="d-flex flex-column align-items-center my-3">
    <div className="text-center">
      <h1>Welcome to Ink Buzz!</h1>
      <h5>Check out some tattoo NFTs below</h5>
    </div>
    <div>
      {NFTData.map((nft) => {
        return <Post key={nft.id} data={nft} />;
      })}
    </div>
  </Container>
);

export default Home;
