import React, { useState, useEffect, useCallback } from 'react';
import { Button, Container, Tab, Row, Col, Nav } from 'react-bootstrap';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { arrayUnion, updateDoc, doc, arrayRemove } from 'firebase/firestore';
import { storage } from '../config/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../store/userStore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useNavigate, useParams } from 'react-router-dom';
import PreviewPost from './previewPost';
import { getProfile } from '../store/profileStore';
import { Heading } from '@chakra-ui/react';
import { updateProfile } from '../store/profileStore';
import { db } from '../config/firebase';
import FollowCard from './FollowCard';
import FavoriteCard from './FavoriteCard';

const ArtistProfile = () => {
  injectStyle();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profileId } = useParams();

  const user = useSelector((state) => state.user.user);
  const artist = useSelector((state) => state.profile.profile);

  const [artistProfile, setArtistProfile] = useState(null);
  const [follows, setFollow] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [refresh, setRefresh] = useState(false);

  //function will follow/unfollow user
  const followToggle = async () => {
    // check if the user is logged in
    if (Object.keys(user).length === 0) {
      navigate('/signIn');
      return;
    }

    //for removing from followers/following
    if (
      user.following &&
      user.following.some((item) => item.id === `${artistProfile.data.id}`)
    ) {
      dispatch(
        updateUser({
          user,
          update: {
            following: arrayRemove({
              id: artistProfile.data.id,
              name: artistProfile.name,
              profilePic: `/images/universal/${artistProfile.data.id}/profile-picture`,
            }),
          },
        }),
      );

      dispatch(
        updateProfile({
          artistProfile,
          update: {
            followers: arrayRemove({
              name: user.name,
              id: user.data.id,
              profilePic: user.profilePic,
            }),
          },
        }),
      );
      setFollow(false);
    }
    //for adding to followers/following
    else {
      dispatch(
        updateUser({
          user,
          update: {
            following: arrayUnion({
              id: artistProfile.data.id,
              name: artistProfile.name,
              profilePic: `/images/universal/${artistProfile.data.id}/profile-picture`,
            }),
          },
        }),
      );
      dispatch(
        updateProfile({
          artistProfile,
          update: {
            followers: arrayUnion({
              name: user.name,
              id: user.data.id,
              profilePic: user.profilePic,
            }),
          },
        }),
      );
      setFollow(true);
    }
  };

  const getPhoto = useCallback(async () => {
    if (artist && artist.profilePic) {
      let getIt = await getDownloadURL(ref(storage, artist.profilePic));
      setPhoto(getIt);
    }
  }, [artist]);

  const messageArtist = async () => {
    if (Object.keys(user).length === 0) {
      navigate('/signIn');
      return;
    }
    chatsWithAdd();
    navigate('/Chat', { state: { chosenInterlocutor: artist.data.id } });
  };

  const chatsWithAdd = async () => {
    const chatsRef = doc(db, 'users', `${user.data.id}`);

    await updateDoc(chatsRef, {
      chatsWith: arrayUnion({
        name: artist.name,
        id: artist.data.id,
        role: null,
        // profilePic: userProfile.profilePic,
      }),
    });
  };

  const onPageLoad = useCallback(async () => {
    await dispatch(getProfile(profileId));
  }, [dispatch, profileId]);

  useEffect(() => {
    setArtistProfile(artist);
    getPhoto();
    //checking if user has artist on follow
    if (
      artist &&
      artist.data &&
      user.following &&
      user.following.some((item) => item.id === `${artist.data.id}`)
    ) {
      setFollow(true);
    } else {
      setFollow(false);
    }
  }, [artist, getPhoto, user]);

  useEffect(() => {
    onPageLoad();
  }, [onPageLoad]);

  return (
    <Container className="mt-3">
      {artistProfile && artist.data ? (
        <div style={{ marginTop: '5rem' }}>
          <div className="d-flex align-items-center">
            <div className="d-flex flex-column align-items-center">
              {photo ? (
                <img src={photo} alt="profile" className="profile-picture" />
              ) : (
                <></>
              )}
            </div>
            <div className="ms-3">
              <Heading size="lg">{artistProfile.name}</Heading>
            </div>
          </div>
          <div className="d-flex mt-3">
            <Button className="me-3" onClick={() => messageArtist()}>
              Message Artist
            </Button>
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
        </div>
      ) : (
        <div></div>
      )}

      <div className="mt-3">
        {artistProfile && artist.data ? (
          <Tab.Container id="left-tabs-example" defaultActiveKey="feed">
            <Row>
              <Col sm={3} className="mb-3">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="feed">Main Feed</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="followers">
                      {(artist.followers && artist.followers.length) || 0}{' '}
                      Followers
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="following">
                      {(artist.following && artist.following.length) || 0}{' '}
                      Following
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="favorites">
                      {(artist.favorites && artist.favorites.length) || 0}{' '}
                      Favorites
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="feed">
                    <Heading className="text-center mb-2" size="xl">
                      {artist.name} has {artist.images.length || 0} designs!
                    </Heading>
                    <div className="d-flex flex-wrap justify-content-evenly align-items-center">
                      {artist.images ? (
                        <div className="d-flex flex-wrap align-items-start feedPostContainer">
                          {artist.images.map((link, index) => {
                            return (
                              <PreviewPost
                                key={index}
                                data={link}
                                creator={artist.name}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="followers">
                    <Heading className="text-center mb-2" size="xl">
                      {artist.name} has {artist.followers.length || 0}{' '}
                      followers:
                    </Heading>
                    <div className="d-flex flex-wrap justify-content-center">
                      {artist.followers.map((artist, idx) => {
                        return (
                          <div
                            key={idx + 'artist' + artist.id}
                            className="me-3">
                            <FollowCard
                              profilePic={artist.profilePic}
                              id={artist.id}
                              name={artist.name}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="following">
                    <Heading className="text-center mb-2" size="xl">
                      {artist.name} is following {artist.following.length || 0}{' '}
                      artists:
                    </Heading>
                    <div className="d-flex flex-wrap justify-content-center">
                      {artist &&
                        artist.following &&
                        artist.following.map((artist, idx) => {
                          return (
                            <div
                              key={idx + 'following' + user.id}
                              className="me-3">
                              <FollowCard
                                profilePic={artist.profilePic}
                                id={artist.id}
                                name={artist.name}
                              />
                            </div>
                          );
                        })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="favorites">
                    <Heading className="text-center mb-2" size="xl">
                      {artist.name} has{' '}
                      {(artist.favorites && artist.favorites.length) || 0}{' '}
                      favorites:
                    </Heading>
                    <div className="d-flex flex-wrap justify-content-center">
                      {artist.favorites &&
                        artist.favorites.map((design, idx) => {
                          return (
                            <div key={idx + design.id} className="me-3">
                              <FavoriteCard
                                favorite={{
                                  id: design.id,
                                  photo: design.image,
                                  name: design.name,
                                  creator: design.creator,
                                }}
                              />
                            </div>
                          );
                        })}
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        ) : (
          <h3>User Not Found</h3>
        )}
      </div>
    </Container>
  );
};

export default ArtistProfile;
