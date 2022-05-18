import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Post from './Post';
import { db, storage } from '../config/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import Search from './SearchBar';
import Favorites from './Favorites';
import FollowedArtists from './FollowedArtists';

const Home = () => {
  const [alphaList, setList] = useState([]);
  const [newList, setNew] = useState([]);
  const [following, setFollow] = useState([]);
  const [userProfile, setUser] = useState(null);

  const aFunction = async () => {
    let enterTheCollector = await collection(db, 'NFTs');
    let docs = await query(enterTheCollector, orderBy('name'), limit(5));
    //this will get a glimpse of designs based on name
    await onSnapshot(docs, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setList((prev) => [...prev, doc.data()]);
      });
    });

    //this query will get us the New Docs for 'recently created' section
    let newDocs = await query(
      enterTheCollector,
      orderBy('created', 'desc'),
      limit(5),
    );

    await onSnapshot(newDocs, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setNew((prev) => [...prev, doc.data()]);
      });
    });
  };

  useEffect(() => {
    aFunction();
  }, []);

  return (
    <Container className="d-flex flex-column align-items-center my-3">
      <div className="text-center">
        <h1>Welcome to Ink Buzz!</h1>
        <h5>Check out some tattoo NFTs below</h5>
      </div>
      <div className="d-flex flex-wrap text-center">
        {alphaList.map((nft) => {
          return <Post key={nft.id} data={nft} />;
        })}
      </div>
      <h1 className="text-center">New Designs</h1>
      <div className="d-flex flex-wrap justify-content-center align-items-center">
        {newList.map((nft) => {
          return <Post key={'new' + nft.id} data={nft} />;
        })}
      </div>
      {/* <FollowedArtists /> */}
      <Search></Search>
    </Container>
  );
};

export default Home;
