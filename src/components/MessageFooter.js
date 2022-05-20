import React from "react";
import { Flex, Input, Button } from "@chakra-ui/react";

const Footer = (props) => {
  const { message, setMessage, sendMessage } = props;
  return (
    <Flex w="100%" mt="5">
      <Input
        placeholder="Type Something..."
        border="1px solid grey"
        borderRadius="md"
        _focus={{
          border: "1px solid black",
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
        value={message.content}
        onChange={(e) => setMessage({ ...message, content: e.target.value })}
      />
      <Button
        bg="black"
        color="white"
        borderRadius="md"
        _hover={{
          bg: "white",
          color: "black",
          border: "1px solid black",
        }}
        onClick={() => sendMessage(message.content)}
      >
        Send
      </Button>
    </Flex>
  );
};

export default Footer;
