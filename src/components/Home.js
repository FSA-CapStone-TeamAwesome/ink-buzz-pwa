import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import 'animate.css';
import Post from './Post';
import { db } from '../config/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import Search from './SearchBar';
import { Heading } from '@chakra-ui/react';
import { getUser } from '../store/userStore';
import { useAuthentication } from '../hooks/useAuthentication';
import { useDispatch } from 'react-redux';

const Home = () => {
  const { userAuth } = useAuthentication();

  const dispatch = useDispatch();
  const [newList, setNew] = useState([]);

  const aFunction = async () => {
    let enterTheCollector = await collection(db, 'NFTs');

    //this query will get us the New Docs for 'recently created' section
    let newDocs = await query(
      enterTheCollector,
      orderBy('created', 'desc'),
      limit(18),
    );

    await onSnapshot(newDocs, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setNew((prev) => [...prev, doc.data()]);
      });
    });
  };

  useEffect(() => {
    aFunction();
    // dispatch(getUser(userAuth));
  }, [dispatch, userAuth]);

  return (
    <Container
      style={{ marginTop: '5rem' }}
      className="d-flex flex-column justify-content-center align-items-center mb-3">
      <div className="text-center">
        <Heading size="2xl">
          <p className="animate__animated animate__zoomIn">
            Welcome to Ink Buzz!
          </p>
        </Heading>
        <Heading size="lg">Check out some tattoo designs below</Heading>
        <Search></Search>
      </div>
      <div className="d-flex flex-wrap justify-content-center align-items-center">
        {newList.map((nft) => {
          return <Post key={'new' + nft.id} data={nft} />;
        })}
      </div>
    </Container>
  );
};

export default Home;
