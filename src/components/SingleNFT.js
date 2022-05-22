import React, { useEffect, useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { db, storage } from '../config/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { updateUser } from '../store/userStore';
import { Heading } from '@chakra-ui/react';

const SingleNFT = () => {
  const [data, setData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [follows, setFollow] = useState(false);
  const [userProfile, setUser] = useState(null);
  const [favored, setFavor] = useState(null);
  const { nftId } = useParams();
  const user = useSelector((state) => state.user.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //function query's server for that Id and finds the right doc for the NFT, causes the rest of the doc to render
  const aFunction = useCallback(async () => {
    let docData = await query(
      collection(db, 'NFTs'),
      where('id', '==', `${nftId}`),
    );
    await onSnapshot(docData, (query) => {
      query.forEach((doc) => {
        setData(doc.data());
      });
    });
  }, [nftId]);

  //function that loads photo
  const getPhoto = useCallback(async () => {
    let getIt = await getDownloadURL(ref(storage, data.image));
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

  //function for toggling the state of following an artist
  const followToggle = async () => {
    const followRef = doc(db, 'users', `${data.creatorId}`);

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
            }),
          },
        }),
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
            }),
          },
        }),
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
    chatsWithAdd();
    if (!follows) {
      followToggle();
    }
    navigate('/Chat', { state: { chosenInterlocutor: data.creatorId } });
  };

  const chatsWithAdd = async () => {
    const chatsRef = doc(db, 'users', `${user.data.id}`);

    await updateDoc(chatsRef, {
      chatsWith: arrayUnion({
        name: data.creator,
        id: data.creatorId,
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
        }),
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
        }),
      );
      setFavor(true);
    }
  };

  useEffect(() => {
    aFunction();
  }, [aFunction]);

  useEffect(() => {
    data && getPhoto();
  }, [data, getPhoto]);

  useEffect(() => setUser(user), [user]);

  if (!data) return <h2>Loading</h2>;

  const { name, creator, price, description, creatorId } = data;

  return (
    <Container
      style={{ marginTop: '5rem' }}
      className="d-flex flex-column justify-content-center align-items-center">
      <Heading>{name}</Heading>
      <Heading size="lg">
        Created by <Link to={`/profiles/${creatorId}`}>{creator} </Link>{' '}
      </Heading>
      <Image fluid style={{ height: '400px' }} src={photo} />
      <h5 className="mt-3">${(price / 100).toFixed(2)}</h5>
      <p>{description}</p>
      {user && user.data ? (
        <div className="d-flex">
          <Button className="me-3" onClick={() => messageArtist()}>
            Message Artist
          </Button>
          {favored ? (
            <Button className="me-3" onClick={favorToggle}>
              Unfavorite
            </Button>
          ) : (
            <Button className="me-3" onClick={favorToggle}>
              Favorite It
            </Button>
          )}
          {follows ? (
            <Button className="me-3" onClick={followToggle}>
              Unfollow Artist
            </Button>
          ) : (
            <Button className="me-3" onClick={followToggle}>
              Follow Artist
            </Button>
          )}
        </div>
      ) : (
        <Button className="mt-3" onClick={() => navigate('/SignIn')}>
          Sign in to message artist
        </Button>
      )}
    </Container>
  );
};

export default SingleNFT;
