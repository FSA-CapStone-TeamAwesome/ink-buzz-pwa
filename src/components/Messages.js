import React, { useEffect, useState, useRef } from "react";
import { Avatar, Flex, Text } from "@chakra-ui/react";
import { getStorage, ref, getBlob } from "firebase/storage";

const Messages = (props) => {
  const { messages, myId, interlocutor } = props;
  console.log("interlocutor is ", interlocutor);
  const [pp, setPp] = useState();
  useEffect(() => {
    if (interlocutor) {
      const storage = getStorage();
      const pathReference = ref(
        storage,
        `images/universal/${interlocutor}/profile-picture`
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
    <Flex w="100%" h="80%" overflowY="scroll" flexDirection="column" p="3">
      {messages.map((msg, index) => {
        if (msg.fromId === myId) {
          return (
            <Flex key={index} w="100%" justify="flex-end">
              <Flex
                bg="black"
                color="white"
                minW="100px"
                maxW="60%"
                my="1"
                p="3"
                borderRadius="md"
              >
                <Text>{msg.content}</Text>
              </Flex>
            </Flex>
          );
        } else {
          return (
            <Flex key={index} w="100%">
              <Avatar name={msg.fromName} src={pp} bg="blue.300"></Avatar>
              <Flex
                bg="gray.100"
                color="black"
                minW="100px"
                maxW="60%"
                my="1"
                p="3"
                borderRadius="md"
              >
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
