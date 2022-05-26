import React, { useEffect, useState, useCallback } from "react";
import { injectStyle } from "react-toastify/dist/inject-style";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { toHex, truncateAddress } from "./wallet_stuff/utils";
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
import { ethers } from "ethers";

import { useDispatch, useSelector } from "react-redux";
import { db, storage } from "../config/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { updateUser } from "../store/userStore";
import { Heading } from "@chakra-ui/react";
import { toast } from "react-toastify";

const SingleNFT = (props) => {
  const [data, setData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [follows, setFollow] = useState(false);
  injectStyle();
  const [userProfile, setUser] = useState(null);
  const [favored, setFavor] = useState(null);
  const [searchObj, setSearchObj] = useState(null);
  const [sendToAddress, setAddress] = useState("");
  const { nftId } = useParams();
  const user = useSelector((state) => state.user.user);
  const [amount, setAmount] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState(null);
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

  //function query's server for that Id and finds the right doc for the NFT, causes the rest of the doc to render
  const aFunction = useCallback(async () => {
    let docData = await query(
      collection(db, "NFTs"),
      where("id", "==", `${nftId}`)
    );
    await onSnapshot(docData, (query) => {
      query.forEach((doc) => {
        setData(doc.data());
      });
    });
  }, [nftId]);

  const bFunction = useCallback(async () => {
    const nameRef = doc(db, "users", data.creatorId);
    const nameFromDoc = await getDoc(nameRef);
    setAddress(nameFromDoc.data().accounts[0]);
  }, [data]);

  useEffect(() => {
    changeOwner();
  }, [message]);

  const changeOwner = async () => {
    if (message == null) {
      return;
    }
    let seller = data.creator;
    let sellerId = data.creatorId;
    let timestamp = Timestamp.fromMillis(Date.now());
    if (data.owner) {
      seller = data.owner;
      sellerId = data.ownerId;
    }
    try {
      await updateDoc(doc(db, "users", `${sellerId}`), {
        billOfSale: arrayUnion({
          nftName: data.name,
          nftId: data.id,
          creator: data.creator,
          creatorId: data.creatorId,
          seller: seller,
          sellerId: sellerId,
          buyer: user.name,
          buyerId: user.data.id,
          linkTransaction: message,
          timestamp,
        }),
      });

      await updateDoc(doc(db, "users", `${user.data.id}`), {
        billOfSale: arrayUnion({
          nftName: data.name,
          nftId: data.id,
          creator: data.creator,
          creatorId: data.creatorId,
          seller: seller,
          sellerId: sellerId,
          buyer: user.name,
          buyerId: user.data.id,
          linkTransaction: message,
          timestamp,
        }),
      });
    } catch (err) {
      console.log(err);
    }

    try {
      await updateDoc(doc(db, "users", `${user.data.id}`), {
        images: arrayUnion({
          data,
        }),
      });
      //removed from user
      await updateDoc(doc(db, "users", `${sellerId}`), {
        images: arrayRemove({
          data,
        }),
      });
    } catch (err) {
      console.log(err);
    }
    toast.success("Image bought");
  };
  //function that loads photo
  const getPhoto = useCallback(async () => {
    let getIt = await getDownloadURL(ref(storage, data.smallImage));
    setPhoto(getIt);

    //checking if user has artist on follow
    if (
      user.following &&
      user.following.some((item) => item.id === `${data.creatorId}`)
    ) {
      setFollow(true);
    } else {
      setFollow(false);
    }

    //checking if the user has the nft as a fav
    if (
      user.favorites &&
      user.favorites.some((item) => item.id === `${data.id}`)
    ) {
      setFavor(true);
    } else {
      setFavor(false);
    }
  }, [data, user]);
  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };
  const handleInput = (e) => {
    const amt = e.target.value;
    setAmount(amt);
  };

  //function for toggling the state of following an artist
  const followToggle = async () => {
    const followRef = doc(db, "users", `${data.creatorId}`);
    if(user.data.id === data.creatorId){return}
    if (
      userProfile.following &&
      user.following.some((item) => item.id === `${data.creatorId}`)
    ) {
      dispatch(
        updateUser({
          user,
          update: {
            following: arrayRemove({
              id: data.creatorId,
              name: data.creator,
              profilePic: `/images/universal/${data.creatorId}/profile-picture`,
            }),
          },
        })
      );

      await updateDoc(followRef, {
        followers: arrayRemove({
          name: userProfile.name,
          id: userProfile.data.id,
          profilePic: userProfile.profilePic,
        }),
      });
      setFollow(false);
    } else {
      dispatch(
        updateUser({
          user,
          update: {
            following: arrayUnion({
              id: data.creatorId,
              name: data.creator,
              profilePic: `/images/universal/${data.creatorId}/profile-picture`,
            }),
          },
        })
      );
      await updateDoc(followRef, {
        followers: arrayUnion({
          name: userProfile.name,
          id: userProfile.data.id,
          profilePic: userProfile.profilePic,
        }),
      });
      setFollow(true);
    }
  };

  const messageArtist = async () => {
    if (user.following.some((item) => item.id === `${(data, ownerId)}`)) {
      chatsWithAdd();
    }
    navigate("/Chat", { state: { chosenInterlocutor: data.creatorId } });
  };

  const chatsWithAdd = async () => {
    const chatsRef = doc(db, "users", `${user.data.id}`);

    await updateDoc(chatsRef, {
      chatsWith: arrayUnion({
        name: data.creator,
        id: data.creatorId,
        role: null,
        // profilePic: userProfile.profilePic,
      }),
    });
  };

  const favorToggle = async () => {
    if (
      userProfile.favorites &&
      userProfile.favorites.some((item) => item.id === `${data.id}`)
    ) {
      dispatch(
        updateUser({
          user,
          update: {
            favorites: arrayRemove({
              id: data.id,
              name: data.name,
              creator: data.creator,
              image: data.image,
            }),
          },
        })
      );
      setFavor(false);
    } else {
      dispatch(
        updateUser({
          user,
          update: {
            favorites: arrayUnion({
              id: data.id,
              name: data.name,
              creator: data.creator,
              image: data.image,
            }),
          },
        })
      );
      setFavor(true);
    }
  };

  useEffect(() => {
    aFunction();
  }, [aFunction]);

  useEffect(() => {
    data && bFunction();
  }, [data, bFunction]);

  const sendTransaction = async () => {
    const nameRef = doc(db, "users", data.creatorId);
    const nameFromDoc = await getDoc(nameRef);

    try {
      const tx = await library.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: nameFromDoc.data().accounts[0],
            value: ethers.utils.parseUnits(amount, "ether").toHexString(),
          },
        ],
      });

      return tx;
    } catch (txError) {
      console.log("txError was ", txError.code);
    }
  };

  useEffect(() => {
    data && getPhoto();
  }, [data, getPhoto]);

  useEffect(() => {
    if (user !== {}) {
      setUser(user);
    }
  }, [user]);

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

  if (!data) return <h2>Loading</h2>;

  const { name, creator, price, description, creatorId, owner, ownerId } = data;

  const artistProfileFunc = (inputtedCreatorId) => {
    if (user && user.data && user.data.id === inputtedCreatorId) {
      navigate("/profile");
    } else {
      navigate(`/profiles/${inputtedCreatorId}`);
    }
  };

  return (
    <Container
      style={{ marginTop: "5rem" }}
      className="d-flex flex-column justify-content-center align-items-center"
    >
      <Heading>{name}</Heading>
      <Heading size="lg" className="mb-3">
        Created by{" "}
        {user && user.data && user.data.id === creatorId ? (
          <Link to={`/profile`}> {creator} </Link>
        ) : (
          <Link to={`/profiles/${creatorId}`}>{creator} </Link>
        )}
      </Heading>
      {owner ? (
        user && user.data && user.data.id === ownerId ? (
          <Heading size="md">
            Owned by <Link to={`/profile`}>{owner} </Link>
          </Heading>
        ) : (
          <Heading size="md">
            Owned by <Link to={`/profiles/${ownerId}`}>{owner} </Link>
          </Heading>
        )
      ) : (
        <></>
      )}
      <Image fluid style={{ height: "400px" }} src={photo} />
      <h5 className="mt-3">Ξ{price / 100}</h5>
      <p className="mt-3">{description}</p>
      {user && user.data ? (
        <div className="d-flex mobile-profile">
          <Button
            className="me-3 mt-3"
            onClick={() => artistProfileFunc(creatorId)}
          >
            Artist's Profile
          </Button>
          <Button className="me-3 mt-3" onClick={() => messageArtist()}>
            Message Artist
          </Button>
          {favored ? (
            <Button className="me-3 mt-3" onClick={favorToggle}>
              Unfavorite
            </Button>
          ) : (
            <Button className="me-3 mt-3" onClick={favorToggle}>
              Favorite It
            </Button>
          )}
          {user && user.data && user.data.id === data.creatorId ?
          <></>
          : (follows ?
          (
            <Button className="me-3 mt-3" onClick={followToggle}>
              Unfollow Artist
            </Button>
          ) : (
            <Button className="me-3 mt-3" onClick={followToggle}>
              Follow Artist
            </Button>
          ))}
          {/* <Button onClick={onOpen} className="me-3 mt-3">
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
                  <Text> */}
          {/* Sending to {interlocutorName} at:{" "} */}
          {/* Sending to: {truncateAddress(sendToAddress)} */}
          {/* </Text>
                ) : (
                  <Text>Uh oh! Target does not have a wallet connected!</Text>
                )}
                <HStack justify="center">
                  <Box
                    maxW="sm"
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    padding="10px">
                    <VStack>
                      <Button onClick={switchNetwork} isDisabled={!network > 0}>
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
                      <Button */}
          {/* onClick={sendTransaction}
                        onClick={async () => {
                          try {
                            const txHash = await sendTransaction();
                            setMessage(txHash, chainId);
                          } catch (e) {
                            console.log(e);
                          }
                        }}
                        isDisabled={!sendToAddress.length}>
                        Send Ether
                      </Button>
                      <Input maxLength={20} value={data.price} w="140px" />
                    </VStack>
                  </Box>
                </HStack>
              </ModalBody>
            </ModalContent>
          </Modal> */}
        </div>
      ) : (
        <div className="d-flex">
          <Button
            className="me-3 mt-3"
            onClick={() => artistProfileFunc(creatorId)}
          >
            Go to Artist's Profile
          </Button>
          <Button className="me-3 mt-3" onClick={() => navigate("/SignIn")}>
            Sign in to message artist
          </Button>
        </div>
      )}
    </Container>
  );
};

export default SingleNFT;
