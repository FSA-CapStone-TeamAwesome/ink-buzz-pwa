import React, { useEffect, useState, useRef } from 'react';
import { Avatar, Flex, Text, Link } from '@chakra-ui/react';
import { getStorage, ref, getBlob } from 'firebase/storage';
import { useDispatch } from 'react-redux';

const Messages = (props) => {
  const { messages, myId, interlocutor } = props;
  const [pp, setPp] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    if (interlocutor) {
      const storage = getStorage();
      const pathReference = ref(
        storage,
        `images/universal/${interlocutor}/profile-picture`,
      );
      getBlob(pathReference).then((blob) => {
        const useUrl = URL.createObjectURL(blob);
        setPp(useUrl);
      });
    }
  }, [interlocutor]);

  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  return (
    <Flex
      w="100%"
      h="80%"
      overflowY="scroll"
      overflowX="hidden"
      flexDirection="column"
      p="3">
      {messages.map((msg, index) => {
        if (msg.isTx) {
          let net = '';
          if (msg.chainId && msg.chainId === 3) {
            net = 'ropsten';
          } else {
            net = 'rinkeby';
          }
          return (
            <Flex key={index} w="100%" justify="center">
              <Flex
                bg="blue.100"
                color="black"
                minW="100px"
                maxW="60%"
                my="1"
                p="3"
                borderRadius="3"
                flexDirection="column">
                <Text>{msg.fromName} sent a payment.</Text>
                <Link
                  href={`http://${net}.etherscan.io/tx/${msg.content}`}
                  isExternal
                  color="purple.500">
                  Click here to view it!
                </Link>
              </Flex>
            </Flex>
          );
        } else if (msg.isStart || msg.isStart === false) {
          return (
            <Flex key={index} w="100%" justify="center">
              <Flex
                bg="orange"
                color="black"
                minW="100px"
                maxW="50%"
                my="1"
                p="3"
                borderRadius="3"
                flexDirection="column"
                className="text-center">
                <Text>{msg.content}</Text>
                {msg.photoUrl !== null ? (
                  <img
                    width="300px"
                    height="300px"
                    src={msg.photoUrl}
                    className="d-flex align-self-center"
                    alt="/"
                  />
                ) : (
                  <></>
                )}
              </Flex>
            </Flex>
          );
        } else if (msg.fromId === myId) {
          return (
            <Flex key={index} minWidth='0' w="100%" justify="flex-end">
              <Flex
                bg="black"
                color="white"
                minW="100px"
                maxW="60%"
                my="1"
                p="3"
                borderRadius="md">
                <Text>{msg.content}</Text>
              </Flex>
            </Flex>
          );
        } else {
          return (
            <Flex key={index} minWidth='0' w="100%">
              <Avatar name={msg.fromName} src={pp} bg="blue.300"></Avatar>
              <Flex
                bg="gray.100"
                color="black"
                minW="100px"
                maxW="60%"
                my="1"
                p="3"
                borderRadius="md">
                <Text>{msg.content}</Text>
              </Flex>
            </Flex>
          );
        }
      })}
      <AlwaysScrollToBottom />
    </Flex>
  );
};

export default Messages;
