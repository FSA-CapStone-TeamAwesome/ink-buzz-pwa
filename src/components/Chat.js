import React, { useState, useEffect } from "react";

import { db } from "../config/firebase";

import { useSelector } from "react-redux";

import Messages from "./Messages";
import MessageFooter from "./MessageFooter";

import {
  Flex,
  Button,
  ButtonGroup,
  HStack,
  VStack,
  Select,
  Input,
  Box,
  useDisclosure,
  Modal,
  ModalHeader,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from "@chakra-ui/react";

import {
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import { toHex, truncateAddress } from "./wallet_stuff/utils";
import { ethers } from "ethers";

// This global variable will be replaced with a converation list

const Chat = (props) => {
  const user = useSelector((state) => state.user.user);

  const [convoList, setConvoList] = useState([]);

  const [myId, setMyId] = useState("");

  const [myName, setMyName] = useState("");

  const [interlocutor, setInterlocutor] = useState("");

  const [sendToAddress, setSendToAddress] = useState("");

  const [messages, setMessages] = useState([]);

  const [amount, setAmount] = useState(0);

  const [message, setMessage] = useState({
    content: "",
    recipient: interlocutor,
    photoUrl: "",
  });

  const { onOpen, isOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (user && user.data) {
      setMyId(user.data.id);
      setConvoList([...user.followers, ...user.following]);
      setMyName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (myId) {
      let q = query(
        collection(db, "messages/queue", myId),
        orderBy("timestamp"),
        limit(100)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });

      return unsub;
    }
  }, [myId, interlocutor]);

  useEffect(() => {
    setMessage({ ...message, recipient: interlocutor });
  }, [interlocutor]);

  useEffect(() => {
    let filteredMessages = messages.filter(
      (msg) => msg.fromId === interlocutor
    );

    if (filteredMessages.length) {
      let sendAddressHolder =
        filteredMessages[filteredMessages.length - 1].fromAddress;
      setSendToAddress(sendAddressHolder);
    } else {
      setSendToAddress("");
    }
  }, [messages, interlocutor]);

  const {
    account,
    setAccount,
    provider,
    setProvider,
    library,
    setLibrary,
    error,
    setError,
    chainId,
    setChainId,
    network,
    setNetwork,
    connectWallet,
    web3Modal,
  } = props;

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const handleInput = (e) => {
    const amt = e.target.value;
    setAmount(amt);
  };

  const sendTransaction = async () => {
    try {
      const tx = await library.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: sendToAddress,
            value: ethers.utils.parseUnits(amount, "ether").toHexString(),
          },
        ],
      });
      console.log("tx is ", tx);
    } catch (txError) {
      console.log("txError was ", txError.code);
    }
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(network) }],
      });
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    setAccount();
    setChainId();
    setNetwork("");
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  // Sending a message should place it in your queue folder as well
  const sendMessage = async () => {
    let timestamp = Timestamp.fromMillis(Date.now());

    let fromAddress = "";

    if (account) {
      fromAddress = account;
    }

    try {
      await addDoc(collection(db, `messages/queue/${message.recipient}`), {
        artReference: null,
        content: message.content,
        fromName: myName,
        fromId: myId,
        fromAddress: fromAddress,
        toId: message.recipient,
        photoUrl: null,
        timestamp,
      });
    } catch (err) {
      console.log("ERROR!");
      console.log(err);
    } finally {
      try {
        await addDoc(collection(db, `messages/queue/${myId}`), {
          artReference: null,
          content: message.content,
          fromName: myName,
          fromId: myId,
          fromAddress: fromAddress,
          toId: message.recipient,
          photoUrl: null,
          timestamp,
        });
      } catch (err) {
        console.log(err);
      }
    }
    setMessage({ ...message, content: "" });
  };

  return (
    <Flex
      w="100%"
      h="100vh"
      justify="center"
      align="center"
      className="chat-component"
    >
      <Flex w="100%" h="90%" flexDir="column">
        <div id="conversations">
          {convoList.map((conversation, idx) => {
            if (interlocutor && interlocutor === conversation.id) {
              return (
                <Button
                  key={idx + conversation.id}
                  style={{ margin: 10 }}
                  bg="lightgrey"
                  border="2px solid black"
                  onClick={() => setInterlocutor(conversation.id)}
                >
                  {conversation.name}
                </Button>
              );
            }
            return (
              <Button
                key={idx + conversation.id}
                style={{ margin: 10 }}
                bg="lightgrey"
                onClick={() => setInterlocutor(conversation.id)}
              >
                {conversation.name}
              </Button>
            );
          })}
          {!account ? (
            <Button onClick={connectWallet} style={{ margin: 10 }}>
              Connect Wallet
            </Button>
          ) : (
            <ButtonGroup spacing="1">
              <Button onClick={onOpen} style={{ margin: 10 }}>
                Send Ether
              </Button>
              <Modal
                isOpen={isOpen}
                onClose={onClose}
                isCentered
                motionPreset="scale"
                size="lg"
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    Active Account: {truncateAddress(account)}
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <HStack justify="center">
                      <Box
                        maxW="sm"
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        padding="10px"
                      >
                        <VStack>
                          <Button onClick={switchNetwork}>
                            Switch Network
                          </Button>
                          <Select
                            placeholder="Select network"
                            onChange={handleNetwork}
                          >
                            <option value="3">Ropsten</option>
                            <option value="4">Rinkeby</option>
                          </Select>
                        </VStack>
                      </Box>
                      <Box
                        maxW="sm"
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        padding="10px"
                      >
                        <VStack>
                          <Button
                            onClick={sendTransaction}
                            isDisabled={sendToAddress.length}
                          >
                            Send Ether
                          </Button>
                          <Input
                            placeholder={sendToAddress}
                            maxLength={20}
                            onChange={handleInput}
                            w="140px"
                          />
                        </VStack>
                      </Box>
                    </HStack>
                  </ModalBody>
                </ModalContent>
              </Modal>
              <Button onClick={disconnect} style={{ margin: 10 }}>
                Disconnect
              </Button>
            </ButtonGroup>
          )}
        </div>
        {messages && (
          <Messages
            messages={messages.filter(
              (msg) =>
                (msg.fromId === myId && msg.toId === interlocutor) ||
                msg.fromId === interlocutor
            )}
            myId={myId}
            interlocutor={interlocutor}
          />
        )}
        <MessageFooter
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </Flex>
    </Flex>
  );
};

export default Chat;
