import React, { useState, useEffect } from "react";

import { Container } from "react-bootstrap";

import { auth, db, app } from "../config/firebase";

import { useAuthentication } from "../hooks/useAuthentication";

import { useSelector } from "react-redux";

import Messages from "./Messages";
import MessageFooter from "./MessageFooter";

import { Flex, Button } from "@chakra-ui/react";

import {
  document,
  getDocs,
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { VStack, Text, HStack, Select, Input, Box } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { networkParams } from "./wallet_stuff/networks";
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
  }, [messages]);

  const {
    navigation,
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
      console.log("txError was ", txError);
    }
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(network) }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[toHex(network)]],
          });
        } catch (error) {
          setError(error);
        }
      }
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
    <Flex w="100%" h="100vh" justify="center" align="center">
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
        {/* <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack>
          {!account ? (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {account ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          <Tooltip label={account} placement="right">
            <Text>{`Account: ${truncateAddress(account)}`}</Text>
          </Tooltip>
          <Text>{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
        </VStack>
        {account && (
          <HStack justifyContent="flex-start" alignItems="flex-start">
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={switchNetwork}>Switch Network</Button>
                <Select placeholder="Select network" onChange={handleNetwork}>
                  <option value="3">Ropsten</option>
                  <option value="4">Rinkeby</option>
                  <option value="42">Kovan</option>
                  <option value="1666600000">Harmony</option>
                  <option value="42220">Celo</option>
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
                <Button onClick={sendTransaction}>Send Ether</Button>
                <Input
                  placeholder="Set Amount"
                  maxLength={20}
                  onChange={handleInput}
                  w="140px"
                />
              </VStack>
            </Box>
          </HStack>
        )}
        <Text>{error ? error.message : null}</Text>
      </VStack> */}
      </Flex>
    </Flex>
  );
};

export default Chat;
