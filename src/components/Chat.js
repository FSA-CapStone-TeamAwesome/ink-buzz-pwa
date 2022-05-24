import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { db, storage } from '../config/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { useSelector } from 'react-redux';
import Messages from './Messages';
import MessageFooter from './MessageFooter';
import {
  Flex,
  Button,
  ButtonGroup,
  HStack,
  VStack,
  Select,
  extendTheme,
  Container,
  Heading,
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
} from 'firebase/firestore';
import ChakraCarousel from './chakraCar';
import { toHex, truncateAddress } from './wallet_stuff/utils';
import { ethers } from 'ethers';

const Chat = (props) => {
  injectStyle();
  const user = useSelector((state) => state.user.user);
  const [convoList, setConvoList] = useState([]);

  const [myId, setMyId] = useState('');

  const [myName, setMyName] = useState('');

  const [interlocutor, setInterlocutor] = useState('');

  const [sendToAddress, setSendToAddress] = useState('');

  const [messages, setMessages] = useState([]);

  const [amount, setAmount] = useState(0);

  const [list, setList] = useState([]);

  //this gets the NFT value from the selector
  const [ripValue, setRip] = useState(null);

  //sets the NFT that is part of the transaction
  const [NFT, setNFT] = useState({});

  //transaction is set
  const [startTransaction, setTransaction] = useState(null);

  const [cryptoURL, setCryptoURL] = useState(null);

  const [sellerId, setSeller] = useState(null);
  // const [interlocutorName, setInterlocutorName] = useState("");

  const [message, setMessage] = useState({
    content: '',
    recipient: interlocutor,
    photoUrl: '',
  });

  const { onOpen, isOpen, onClose } = useDisclosure();

  const location = useLocation();

  useEffect(() => {
    if (user && user.data) {
      setMyId(user.data.id);
      setMyName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (myId) {
      let q = query(
        collection(db, 'messages/queue', myId),
        orderBy('timestamp', 'desc'),
        limit(40),
      );

      let convoIds = convoList.map((convo) => convo.id);
      let findIt = convoIds.indexOf(interlocutor);
      const unsub = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.reverse().map((doc) => doc.data()));
      });
      return unsub;
    }
  }, [myId, interlocutor]);

  useEffect(() => {
    setMessage({ ...message, recipient: interlocutor });
    getList();
    let convoIds = convoList.map((convo) => convo.id);
  }, [interlocutor]);

  useEffect(() => {
    if (location.state && location.state.chosenInterlocutor) {
      setInterlocutor(location.state.chosenInterlocutor);
    }

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
      (msg) => msg.fromId === interlocutor,
    );

    if (filteredMessages.length) {
      let sendAddressHolder =
        filteredMessages[filteredMessages.length - 1].fromAddress;
      setSendToAddress(sendAddressHolder);
    } else {
      setSendToAddress('');
    }
  }, [messages, interlocutor]);

  useEffect(() => {
    if (myId) {
      const unsub = onSnapshot(doc(db, 'users', `${myId}`), (doc) => {
        setConvoList(doc.data().chatsWith);
      });
      return unsub;
    }
  }, [myId]);

  useEffect(() => {
    checkTransaction();
  }, [convoList, messages]);

  const checkTransaction = async () => {
    console.log('trans checked');
    let convoIds = convoList.map((convo) => convo.id);
    let findIt = convoIds.indexOf(interlocutor);

    if (convoList.length && convoList[findIt].role === 'buyer') {
      setTransaction(true);
      setSeller(false);
      setNFT(convoList[findIt].nft);

      return;
    }
    if (convoList.length && convoList[findIt].role === 'seller') {
      setTransaction(true);
      setSeller(true);
      setNFT(convoList[findIt].nft);
      return;
    }
    setSeller(null);
    setTransaction(null);
    setNFT(null);
  };

  const chatsWithAdd = async (id) => {
    const nameRef = doc(db, 'users', id);
    const nameFromDoc = await getDoc(nameRef);

    const chatsRef = doc(db, 'users', `${user.data.id}`);
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
    library,
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
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: sendToAddress,
            value: ethers.utils.parseUnits(amount, 'ether').toHexString(),
          },
        ],
      });
      console.log(tx);
      return tx;
    } catch (txError) {
      console.log('txError was ', txError.code);
    }
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHex(network) }],
      });
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    setAccount();
    setChainId();
    setNetwork('');
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
            collection(db, 'NFTs'),
            where('ownerId', '==', `${interlocutor}`),
          ),
          (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              setList((prev) => [...prev, doc.data()]);
            });
          },
        ),
      );
    } catch (err) {
      console.log(err);
    }
  }

  //Completes transaction, wipes the state.

  // Sending a message should place it in your queue folder as well
  const sendMessage = async () => {
    let timestamp = Timestamp.fromMillis(Date.now());

    let fromAddress = '';

    if (account) {
      fromAddress = account;
    }

    try {
      await addDoc(collection(db, `messages/queue/${interlocutor}`), {
        artReference: null,
        content: message.content,
        fromName: myName,
        fromId: myId,
        fromAddress: fromAddress,
        toId: interlocutor,
        isTx: false,
        chainId: null,
        photoUrl: null,
        timestamp,
      });
    } catch (err) {
      console.log('ERROR!');
      console.log(err);
    } finally {
      try {
        await addDoc(collection(db, `messages/queue/${myId}`), {
          artReference: null,
          content: message.content,
          fromName: myName,
          fromId: myId,
          fromAddress: fromAddress,
          toId: interlocutor,
          isTx: false,
          chainId: null,
          photoUrl: null,
          timestamp,
        });
      } catch (err) {
        console.log(err);
      }
    }

    setMessage({ ...message, content: '' });
  };

  const sendTxMessage = async (txHash, chainId) => {
    let timestamp = Timestamp.fromMillis(Date.now());

    let fromAddress = '';

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
      console.log('ERROR!');
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
    setMessage({ ...message, content: '' });
  };

  //as the name suggests it cancels, and how it operates depends on if you are seller or buyer
  async function cancelTransaction(role) {
    const text = `Transaction Cancelled by the ${role}, ${myName}.`;
    let yourRole = '';
    let theirRole = '';

    if (role === 'seller') {
      yourRole = 'seller';
      theirRole = 'buyer';
    }
    if (role === 'buyer') {
      yourRole = 'buyer';
      theirRole = 'seller';
    }

    let fromAddress = '';
    if (account) {
      fromAddress = account;
    }
    let timestamp = Timestamp.fromMillis(Date.now());
    try {
      let convoIds = convoList.map((convo) => convo.id);
      let findIt = convoIds.indexOf(interlocutor);
      let convo = convoList[findIt];

      const nameRef = doc(db, 'users', interlocutor);
      const chatsRef = doc(db, 'users', `${user.data.id}`);
      await updateDoc(chatsRef, {
        chatsWith: arrayRemove({
          name: convo.name,
          id: interlocutor,
          role: yourRole,
          nft: convo.nft,
        }),
      });

      //update for the other party
      await updateDoc(nameRef, {
        chatsWith: arrayRemove({
          name: myName,
          id: myId,
          role: theirRole,
          nft: convo.nft,
        }),
      });

      await updateDoc(nameRef, {
        chatsWith: arrayUnion({
          name: myName,
          id: myId,
          role: null,
        }),
      });

      await updateDoc(chatsRef, {
        chatsWith: arrayUnion({
          name: convo.name,
          id: interlocutor,
          role: null,
        }),
      });
    } catch (err) {
      console.log(err);
    } finally {
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
        console.log('ERROR!');
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
        setSeller(null);
        setNFT(null);
        setTransaction(null);
      }
      setMessage({ ...message, content: '' });
    }
  }

  function validURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  }

  async function sendNFT() {
    if (!validURL(cryptoURL)) {
      toast.error('Submit a valid URL for the transaction to confirm.');
      return;
    }

    let fromAddress = '';
    if (account) {
      fromAddress = account;
    }

    const nameRef = doc(db, 'users', interlocutor);
    const nameFromDoc = await (await getDoc(nameRef)).data().name;
    const text = `Transaction completed. ${NFT.name} has been sold to ${nameFromDoc}.`;
    let timestamp = Timestamp.fromMillis(Date.now());

    try {
      //from your side, you REMOVE the array with them in it
      const chatsRef = doc(db, 'users', `${user.data.id}`);
      await updateDoc(chatsRef, {
        chatsWith: arrayRemove({
          name: nameFromDoc,
          id: interlocutor,
          role: 'seller',
          nft: NFT,
        }),
      });

      await updateDoc(chatsRef, {
        chatsWith: arrayUnion({
          name: nameFromDoc,
          id: interlocutor,
          role: null,
        }),
      });

      //correcting the other parties' log reset
      await updateDoc(nameRef, {
        chatsWith: arrayRemove({
          name: myName,
          id: myId,
          role: 'buyer',
          nft: NFT,
        }),
      });

      await updateDoc(nameRef, {
        chatsWith: arrayUnion({
          name: myName,
          id: myId,
          role: null,
        }),
      });
    } catch (err) {
      console.log(err);
    }

    try {
      let change = await doc(db, 'users', `${interlocutor}`);
      await updateDoc(change, {
        billOfSale: arrayUnion({
          nftName: NFT.name,
          nftId: NFT.id,
          creator: NFT.creator,
          creatorId: NFT.creatorId,
          seller: myName,
          sellerId: myId,
          buyer: nameFromDoc,
          buyerId: interlocutor,
          linkTransaction: cryptoURL,
          timestamp,
        }),
      });
      //removed from user
      await updateDoc(doc(db, 'users', `${myId}`), {
        billOfSale: arrayUnion({
          nftName: NFT.name,
          nftId: NFT.id,
          creator: NFT.creator,
          creatorId: NFT.creatorId,
          seller: myName,
          sellerId: myId,
          buyer: nameFromDoc,
          buyerId: interlocutor,
          linkTransaction: cryptoURL,
          timestamp,
        }),
      });
    } catch (err) {
      console.log(err);
    }

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
      console.log('ERROR!');
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

      try {
        await updateDoc(doc(db, 'NFTs', `${NFT.name + NFT.created}`), {
          owner: nameFromDoc,
          ownerId: interlocutor,
        });
      } catch (err) {
        console.log(err);
      }

      try {
        let nft = user.images.find((o) => o.name === NFT.name);
        await updateDoc(doc(db, 'users', `${interlocutor}`), {
          images: arrayUnion(nft),
        });
        //removed from user
        await updateDoc(doc(db, 'users', `${myId}`), {
          images: arrayRemove(nft),
        });
      } catch (err) {
        console.log(err);
      }

      setSeller(null);
      setNFT(null);
      setTransaction(null);
    }
  }

  async function manageTransaction() {
    const internalNFT = list[ripValue];
    let timestamp = Timestamp.fromMillis(Date.now());
    let fromAddress = '';
    const nameRef = doc(db, 'users', interlocutor);
    const nameFromDoc = await getDoc(nameRef);
    const chatsRef = doc(db, 'users', `${user.data.id}`);
    const photo = await getDownloadURL(ref(storage, internalNFT.image));
    let text = `${myName} would like to purchase the design, ${
      internalNFT.name
    }, created by ${internalNFT.creator}. The going rate is ${
      internalNFT.price / 100
    } Ethereum. When payment is recieved, please confirm so transaction can clear.`;

    if (account) {
      fromAddress = account;
    }

    try {
      await updateDoc(chatsRef, {
        chatsWith: arrayRemove({
          name: nameFromDoc.data().name,
          id: interlocutor,
          role: null,
        }),
      });

      await updateDoc(nameRef, {
        chatsWith: arrayRemove({
          name: myName,
          id: myId,
          role: null,
        }),
      });

      await updateDoc(chatsRef, {
        chatsWith: arrayUnion({
          name: nameFromDoc.data().name,
          id: interlocutor,
          role: 'buyer',
          nft: internalNFT,
        }),
      });
      //update for current user

      await updateDoc(nameRef, {
        chatsWith: arrayUnion({
          name: myName,
          id: myId,
          role: 'seller',
          nft: internalNFT,
        }),
      });
    } catch (error) {
      console.log(error);
    }

    try {
      await addDoc(collection(db, `messages/queue/${message.recipient}`), {
        artReference: null,
        content: text,
        fromName: myName,
        fromId: myId,
        fromAddress: fromAddress,
        toId: message.recipient,
        isStart: true,
        photoUrl: photo,
        timestamp,
      });
    } catch (err) {
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
          photoUrl: photo,
          timestamp,
        });
      } catch (err) {
        console.log(err);
      }
    }

    setMessage({ ...message, content: '' });
  }
  return (
    <Flex
      w="100%"
      h="100vh"
      justify="center"
      align="center"
      className="chat-component">

      <Flex w="100%" h="90%" flexDir="column">

        <div id="conversations">
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
        <ChakraCarousel gap={10}>

          {convoList &&
            convoList.map((conversation, idx) => {
              return (
                <Flex
                key={idx}
                boxShadow="rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px"
                justifyContent="space-between"
                flexDirection="column"
                overflow="hidden"
                color="gray.300"
                bg="base.d100"
                rounded={5}
                flex={1}
                p={1}
                  >
                <VStack mb={6}>
              {interlocutor && interlocutor === conversation.id ?

                  <Button
                    key={idx + conversation.id}
                    style={{ margin: 10 }}
                    bg="lightgrey"
                    border="2px solid black"
                    onClick={() => {
                      setList([]);
                      setInterlocutor(conversation.id);
                    }}>
                    {conversation.name}
                  </Button>
                 :
                <Button
                  key={idx + conversation.id}
                  style={{ margin: 10 }}

                  onClick={() => {
                    setList([]);
                    setInterlocutor(conversation.id);
                  }}>
                  {conversation.name}
                </Button>
            }
                </VStack>
                </Flex>
             )})}

           </ChakraCarousel>
           </Container>
          {!account ? (
            <Button
              onClick={connectWallet}
              style={{ margin: 10, marginTop: 30 }}>
              Connect Wallet
            </Button>
          ) : (
            <ButtonGroup spacing="1">
              <Button onClick={onOpen} style={{ margin: 10, marginTop: 30 }}>
                Send Ether
              </Button>
              <Modal
                isOpen={isOpen}
                onClose={onClose}
                isCentered
                motionPreset="scale"
                size="lg">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    Active Account: {truncateAddress(account)}
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    {sendToAddress.length ? (
                      <Text>Sending to: {truncateAddress(sendToAddress)}</Text>
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
                        padding="10px">
                        <VStack>
                          <Button
                            onClick={switchNetwork}
                            isDisabled={!network > 0}>
                            Choose Network
                          </Button>
                          <Select
                            placeholder="Select network"
                            onChange={handleNetwork}>
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
                        padding="10px">
                        <VStack>
                          <Button
                            onClick={async () => {
                              try {
                                const txHash = await sendTransaction();
                                sendTxMessage(txHash, chainId);
                              } catch (e) {
                                console.log(e);
                              }
                            }}
                            isDisabled={!sendToAddress.length}>
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
              <Button
                onClick={disconnect}
                style={{ margin: 10, marginTop: 30 }}>
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
                msg.fromId === interlocutor,
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
          list.length ? (
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
                }}>
                Begin Transaction
              </Button>
            </Form>
          ) : (
            <></>
          )
        ) : sellerId ? (
          <Form>
            <p>
              After Receiving payment, please confirm transaction. If the pay is
              not to your liking, cancel.
            </p>

            <Button
              className=" m-3"
              onClick={() => {
                setTransaction(null);
                cancelTransaction('seller');
              }}>
              Cancel Transaction
            </Button>
            <Input
              placeholder="Place Transaction Link Here"
              border="1px solid grey"
              borderRadius="md"
              value={cryptoURL}
              onChange={(e) => setCryptoURL(e.target.value)}
            />
            <Button
              className=" m-3"
              onClick={() => {
                sendNFT();
              }}>
              Confirm Payment
            </Button>
          </Form>
        ) : (
          <Form>
            <p>
              Transaction is Pending... cannot submit until previous transaction
              is cancelled be either party or cleared by the seller.
            </p>
            <Button
              className=" m-3"
              onClick={() => {
                setTransaction(null);
                cancelTransaction('buyer');
              }}>
              Cancel Transaction
            </Button>
          </Form>
        )}
      </Flex>
    </Flex>
  );
};

export default Chat;
