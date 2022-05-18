import React, { useState, useEffect } from "react";

import { Button } from "react-bootstrap";

import { auth, db, app } from "../config/firebase";

import { useAuthentication } from "../hooks/useAuthentication";

import { useSelector } from "react-redux";

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

// chat2@chat.com
// YnK59v2GMRcRtFTZ7jlSXIaxu1G3
// 0xb936376169B6E0593922611F64A6B46b847cb262

// chat1@chat.com
// JotxkdT73WZxdfVuw00itwp2GWr1
// 0xd18ac37aAbA82aAdBfC8BFD6fEF8A42DF1c28352

// This global variable will be replaced with a converation list

const Chat = (props) => {
  // const { user } = useAuthentication();

  const user = useSelector((state) => state.user.user);

  const [convoList, setConvoList] = useState([]);

  const [myId, setMyId] = useState("");

  const [myName, setMyName] = useState("");

  const [interlocutor, setInterlocutor] = useState("");

  const [messages, setMessages] = useState([]);

  const [amount, setAmount] = useState(0);

  const [message, setMessage] = useState({
    content: "",
    recipient: interlocutor,
    photoUrl: "",
  });


  useEffect(() => {
    if (user && user.data) {
      setMyId(user.data.id)
      setConvoList([...user.followers, ...user.following])
    }
  }, [user])

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
    setMessage({...message, recipient: interlocutor})
  }, [interlocutor])

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
            to: "0xbB398f050223c11ae1e516371B73e7856Bfae077",
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
  const sendMessage = async (evt) => {
    evt.preventDefault();

    let timestamp = Timestamp.fromMillis(Date.now());

    let fromAddress = '';

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
    setMessage({...message, content: ''})
  };

  return (
    <>
      <h1>Chat</h1>
      <div id="conversations">
        {convoList.map((conversation) => {
          return (
            <Button
              key={conversation.id}
              style={{ margin: 10 }}
              variant="primary"
              onClick={() => setInterlocutor(conversation.id)}
            >
              {conversation.name}
            </Button>
          );
        })}
      </div>

      {messages &&
        messages.map((msg) => {
          if (msg.fromId === myId && msg.toId === interlocutor) {
            return (
              <div
                style={{ display: "flex", justifyContent: "flex-end" }}
                key={msg.id}
              >
                {msg.content}
              </div>
            );
          } else if (msg.fromId === interlocutor) {
            return (
              <div
                style={{ display: "flex", justifyContent: "flex-start" }}
                key={msg.id}
              >
                {msg.content}
              </div>
            );
          } else {
          }
        })}

      <form
        className="controls"
        style={{ display: "flex", justifyContent: "flex-end" }}
        onSubmit={sendMessage}>
        <input
          placeholder="message"
          type="content"
          value={message.content}
          onChange={(evt) => {
            setMessage({ ...message, content: evt.target.value });
          }}
        />
        <Button type="submit">Send</Button>
      </form>
      <VStack justifyContent="center" alignItems="center" h="100vh">
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
      </VStack>
    </>
  );
};

export default Chat;
