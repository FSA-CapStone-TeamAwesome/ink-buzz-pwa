import React, { useState, useEffect } from "react";

import { Container, Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";

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
  Text,
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
  doc,
  where,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { toHex, truncateAddress } from "./wallet_stuff/utils";
import { ethers } from "ethers";

import { NetworkFirst } from "workbox-strategies";
import { SignEthereumTransactionResponse } from "@coinbase/wallet-sdk/dist/relay/Web3Response";

// This global variable will be replaced with a converation list

const Chat = (props) => {
  const user = useSelector((state) => state.user.user);

  const [convoList, setConvoList] = useState([]);

  const [myId, setMyId] = useState("");

  const [myName, setMyName] = useState("");

  const [interlocutor, setInterlocutor] = useState("");

  const [chosenInterlocutor, setChosenInterlocutor] = useState("");

  const [sendToAddress, setSendToAddress] = useState("");



  const [messages, setMessages] = useState([]);

  const [amount, setAmount] = useState(0);

  const [list, setList] = useState([]);
  const [ripValue, setRip] = useState(null);

  const [NFT, setNFT] = useState({});

  const [startTransaction, setTransaction] = useState(null);

  const [completeTransaction, setComplete] = useState(null);

  const [sellerId, setSeller] = useState(null);
  // const [interlocutorName, setInterlocutorName] = useState("");

  const [message, setMessage] = useState({
    content: "",
    recipient: interlocutor,
    photoUrl: "",
  });

  const { onOpen, isOpen, onClose } = useDisclosure();

  const location = useLocation();



  useEffect(() => {
    if (user && user.data) {
      setMyId(user.data.id);
      setConvoList([...user.chatsWith]);
      setMyName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (myId) {
      let q = query(
        collection(db, "messages/queue", myId),
        orderBy("timestamp"),
        limit(40)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });

      return unsub;
    }
  }, [myId]);

  useEffect(() => {
    setMessage({ ...message, recipient: interlocutor });
    getList();
    let convoIds = convoList.map((convo) => convo.id);
    let findIt = convoIds.indexOf(interlocutor);

    if (convoList.length && convoList[findIt].role === "buyer") {
      setTransaction(true);
      setSeller(false);
      setNFT(convoList[findIt].nft)
    }
    if (convoList.length && convoList[findIt].role === "seller") {
      setTransaction(true);
      setSeller(true);
      setNFT(convoList[findIt].nft)
    }
  }, [interlocutor]);

  useEffect(() => {
    if (location.state && location.state.chosenInterlocutor) {
      setInterlocutor(location.state.chosenInterlocutor);
    }
    setChosenInterlocutor("");
    location.state = {};
  }, []);

  useEffect(() => {
    let convoIds = convoList.map((convo) => convo.id);

    let allInterlocutorIds = [
      ...new Set([
        ...messages.map((msg) => msg.fromId),
        ...messages.map((msg) => msg.toId),
      ]),
    ].filter((id) => id !== myId);

    allInterlocutorIds.forEach((id) => {
      if (id && !convoIds.includes(id)) {
        chatsWithAdd(id);
      }

    });

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

  const chatsWithAdd = async (id) => {
    const nameRef = doc(db, "users", id);
    const nameFromDoc= await getDoc(nameRef)

    const chatsRef = doc(db, "users", `${user.data.id}`);
    await updateDoc(chatsRef, {
      chatsWith: arrayUnion({
        name: nameFromDoc.data().name,
        role: null,
        id,
      }),
    });
  };

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
      console.log(tx);
      return tx;
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

  //function gets list of available NFTs for sale and is mapped into a list
  async function getList() {
    try {
      Promise.all(
        onSnapshot(
          query(
            collection(db, "NFTs"),
            where("creatorId", "==", `${interlocutor}`)
          ),
          (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log(doc.data());
              setList((prev) => [...prev, doc.data()]);
            });
          }
        )
      );
    } catch (err) {
      console.log(err);
    }
  }


  //Completes transaction, wipes the state.
  async function sendNFT() {
    let fromAddress =''
    if (account) {
      fromAddress = account;
    }

    let change = await doc(db, "users", `${interlocutor}`);
    await updateDoc(change, {
      ownedNFT: arrayUnion({
        NFT,
      }),
    });
    const nameRef = doc(db, "users", interlocutor);
    const nameFromDoc= await getDoc(nameRef)


    const text = `Transaction completed. ${NFT.name} has been sold to ${nameFromDoc.data().name}.`
    let timestamp = Timestamp.fromMillis(Date.now());
    try {
      await addDoc(collection(db, `messages/queue/${message.recipient}`), {
        artReference: null,
        content: text,
        fromName: myName,
        fromId: myId,
        fromAddress: fromAddress,
        toId: message.recipient,
        isStart: false,
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
          content: text,
          fromName: myName,
          fromId: myId,
          fromAddress: fromAddress,
          toId: message.recipient,
          isStart: false,
          photoUrl: null,
          timestamp,
        });
      } catch (err) {
        console.log(err);
      }

    await updateDoc(nameRef, {
      chatsWith: arrayRemove({
        name: nameFromDoc.data().name,
        id: interlocutor,
        role: "buyer",
        nft: NFT
      }),
    });

    await updateDoc(nameRef, {
      chatsWith: arrayUnion({
        name: nameFromDoc.data().name,
        id: interlocutor,
        role: null,
      }),
    });

    const chatsRef = doc(db, "users", `${user.data.id}`);
    await updateDoc(chatsRef, {
      chatsWith: arrayRemove({
        name: myName,
        id: myId,
        role: "seller",
        nft: NFT
      }),
    });

    await updateDoc(chatsRef, {
      chatsWith: arrayUnion({
        name: myName,
        id: myId,
        role: null,
      }),
    });
    setNFT(null);
  }
}

  async function manageTransaction(bool) {
    let text = "";

    let yourRole = '';
    let theirRole = '';
    const internalNFT = list[ripValue];
    let timestamp = Timestamp.fromMillis(Date.now());
    let fromAddress = "";
    const nameRef = doc(db, "users", interlocutor );
    const nameFromDoc= await getDoc(nameRef)
    const chatsRef = doc(db, "users", `${user.data.id}`);

    if (!bool) {
      text = `Transaction Cancelled by ${myName}`;
      setNFT(null);
    } else {
      text = `${myName} would like to purchase the design, ${
        internalNFT.name
      }, created by ${internalNFT.creator}. The going rate is $${(
        internalNFT.price / 100
      ).toFixed(
        2
      )}. When payment is recieved, please confirm so transaction can clear.`;
    }

    if (account) {
      fromAddress = account;
    }

    //we're sending a message, either starting or canceling the transaction
    try {
      await addDoc(collection(db, `messages/queue/${message.recipient}`), {
        artReference: null,
        content: text,
        fromName: myName,
        fromId: myId,
        fromAddress: fromAddress,
        toId: message.recipient,
        isStart: true,
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
          content: text,
          fromName: myName,
          fromId: myId,
          fromAddress: fromAddress,
          toId: message.recipient,
          isStart: true,
          photoUrl: null,
          timestamp,
        });
      } catch (err) {
        console.log(err);
      }

      if (bool) {


        yourRole = "buyer"
        theirRole = "seller"

        await updateDoc(chatsRef, {
          chatsWith: arrayRemove({
            name: nameFromDoc.data().name,
            id: internalNFT["creatorId"],
            role: null,

          }),
        });

        await updateDoc(chatsRef, {
          chatsWith: arrayUnion({
            name: nameFromDoc.data().name,
            id: internalNFT["creatorId"],
            role: yourRole,
            nft: internalNFT
          }),
        });
        //update for current user
        await updateDoc(nameRef, {
          chatsWith: arrayRemove({
            name: myName,
            id: myId,
            role: null,

          }),
        });
        console.log("anything?");

        await updateDoc(nameRef, {
          chatsWith: arrayUnion({
            name: myName,
            id: myId,
            role: theirRole,
            nft: internalNFT
          }),
        });
        //update for seller
      }


      //If the transaction is being terminated, this is going to occur
      if(!bool){
        if(sellerId){
        yourRole = 'seller'
        theirRole = 'buyer'
        }
        if(!sellerId){
          yourRole = 'buyer'
          theirRole = 'seller'
        }

        await updateDoc(chatsRef, {
          chatsWrith: arrayRemove({
            name: nameFromDoc.data().name,
            id: interlocutor,
            role: yourRole,
            nft: NFT
          }),
        });

        await updateDoc(chatsRef, {
          chatsWith: arrayUnion({
            name: nameFromDoc.data().name,
            id: interlocutor,
            role: null,
          }),
        });
        //update for current user
        await updateDoc(nameRef, {
          chatsWith: arrayRemove({
            name: myName,
            id: myId,
            role: theirRole,
            nft: NFT
          }),
        });


        await updateDoc(nameRef, {
          chatsWith: arrayUnion({
            name: myName,
            id: myId,
            role: null,
          }),
        });
        setSeller(null)
      }

      }

    setMessage({ ...message, content: "" });
  }



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
        isTx: false,
        chainId: null,
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
          isTx: false,
          chainId: null,
          photoUrl: null,
          timestamp,
        });
      } catch (err) {
        console.log(err);
      }
    }

    setMessage({ ...message, content: "" });
  };

  const sendTxMessage = async (txHash, chainId) => {
    let timestamp = Timestamp.fromMillis(Date.now());

    let fromAddress = "";

    if (account) {
      fromAddress = account;
    }

    try {
      await addDoc(collection(db, `messages/queue/${message.recipient}`), {
        artReference: null,
        content: txHash,
        fromName: myName,
        fromId: myId,
        fromAddress: fromAddress,
        toId: message.recipient,
        isTx: true,
        chainId: network,
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
          content: txHash,
          fromName: myName,
          fromId: myId,
          fromAddress: fromAddress,
          toId: message.recipient,
          isTx: true,
          chainId: network,
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
              // setInterlocutorName(conversation.name);
              return (
                <Button
                  key={idx + conversation.id}
                  style={{ margin: 10 }}
                  bg="lightgrey"
                  border="2px solid black"
                  onClick={() => {
                    setList([]);
                    setInterlocutor(conversation.id);
                  }}
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
                onClick={() => {
                  setList([]);
                  setInterlocutor(conversation.id);
                }}
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
                    {sendToAddress.length ? (
                      <Text>
                        {/* Sending to {interlocutorName} at:{" "} */}
                        Sending to: {truncateAddress(sendToAddress)}
                      </Text>
                    ) : (
                      <Text>
                        Uh oh! Target does not have a wallet connected!
                      </Text>
                    )}
                    <HStack justify="center">
                      <Box
                        maxW="sm"
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        padding="10px"
                      >
                        <VStack>
                          <Button
                            onClick={switchNetwork}
                            isDisabled={!network > 0}
                          >
                            Choose Network
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
                            // onClick={sendTransaction}
                            onClick={async () => {
                              try {
                                const txHash = await sendTransaction();
                                sendTxMessage(txHash, chainId);
                              } catch (e) {
                                console.log(e);
                              }
                            }}
                            isDisabled={!sendToAddress.length}
                          >
                            Send Ether
                          </Button>
                          <Input
                            placeholder="Set Amount"
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
        {!startTransaction ? (
          list.length ?
          <Form onChange={(evt) => setRip(evt.target.value)}>
            <Form.Select name="nftId" className="w-50 m-3">
              <option value="null">-</option>
              {list.map((nft, index) => {
                return (
                  <option key={nft.id} value={`${index}`}>
                    {nft.name}
                  </option>
                );
              })}
            </Form.Select>
            <Button
              className=" m-3"
              onClick={() => {
                if (ripValue === null) {
                  return;
                }
                setNFT(list[ripValue]);
                setTransaction(true);
                manageTransaction(true);
              }}
            >
              Begin Transaction
            </Button>
          </Form> : <></>
        ) : sellerId ? (
          <Form>
            <p>After Receiving payment, please confirm transaction. If the pay is not to your liking,</p>
            <Button
              className=" m-3"
              onClick={() => {
                setTransaction(null);
                setSeller(null)
                sendNFT();
              }}
            >
              Confirm Payment
            </Button>

            <Button
              className=" m-3"
              onClick={() => {


                setTransaction(null);
                manageTransaction(false);
              }}
            >
              Cancel Transaction
            </Button>
          </Form>
        ) : (
          <Form>
            <p>
              Transaction is Pending... cannot submit until previous transaction
              is cancelled or cleared
            </p>
            <Button
              className=" m-3"
              onClick={() => {
                setNFT(null);
                setTransaction(null);
                manageTransaction(false);
              }}
            >
              Cancel Transaction
            </Button>
          </Form>
        )}
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
