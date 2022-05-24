import React, { useEffect, useState } from 'react';

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
import { useAuthentication } from '../hooks/useAuthentication';
import { useDispatch } from 'react-redux';
import Footer from './Footer';
import {
  Flex,
  Button,
  ButtonGroup,
  HStack,
  VStack,
  Container,
  Select,
  extendTheme,
  Tag,
  Input,
  Box,
  useDisclosure,
  Text,
  Modal,
  ModalHeader,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from '@chakra-ui/react';
import ChakraCarousel from './chakraCar';

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
      <Container
        py={8}
        px={0}
        maxW={{
          base: "100%",
          sm: "35rem",
          md: "43.75rem",
          lg: "57.5rem",
          xl: "75rem",
          xxl: "87.5rem"
        }}
      >
      <ChakraCarousel gap={80}>
        {newList.map((nft, idx) => {
            return <Flex
            key={idx}

            justifyContent="space-between"
            flexDirection="column"
            overflow="hidden"
            color="gray.300"
            bg="base.d100"
            rounded={5}
            flex={1}
            p={5}
          >
            <VStack mb={5}>
          <Post key={nft.id} data={nft} />;
          </VStack>
          </Flex>
        })}
         </ChakraCarousel>
         </Container>
      </div>
      {/* <Footer /> */}

    </Container>
  );
};

export default Home;
