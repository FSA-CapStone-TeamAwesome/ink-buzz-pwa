import React, { useState, useEffect, useCallback } from 'react';
import { Button, Container, Form, Tab, Row, Col, Nav } from 'react-bootstrap';
import profilePicImg from '../assets/images/default-profile.jpeg';
import { toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, updateUser } from '../store/userStore';
import {
  getAuth,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import PreviewPost from './previewPost';
import FollowedArtists from './FollowedArtists';
import { Heading } from '@chakra-ui/react';
import FollowCard from './FollowCard';
import FavoriteCard from './FavoriteCard';
import { useAuthentication } from '../hooks/useAuthentication';
import Compressor from 'compressorjs';

const Profile = () => {
  injectStyle();
  const dispatch = useDispatch();
  const userAuth = useAuthentication();
  const userAuthObj = userAuth.user;

  const [show, setShow] = useState(false);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const user = useSelector((state) => state.user.user);
  const following = useSelector((state) => state.following.following);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');

  const handleCancel = () => {
    setShow(!show);
    setFormPassword('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (formEmail.length && formPassword.length) {
      const credentials = EmailAuthProvider.credential(
        auth.currentUser.email,
        formPassword,
      );

      await reauthenticateWithCredential(auth.currentUser, credentials)
        .then(() => {
          updateEmail(auth.currentUser, formEmail)
            .then(() => {
              toast.success('Profile Updated!');
            })
            .catch((error) => {
              toast.error('Error Occurred!');
              console.error('update email error');
              console.log(error);
              return;
            });
        })
        .catch((error) => {
          toast.error('Incorrect Password!');
          console.error('wrong password');
          console.log(error);
          return;
        });

      await dispatch(
        updateUser({
          user,
          update: {
            name: formName,
            data: { email: formEmail, id: user.data.id, location: '' },
          },
        }),
      );

      //Start Image Upload Code Here
      if (imageUpload) {
        //We're uploading a photo to the storage, its path is the user's folder, and the filename is profile-picture
        const imageRef = ref(
          storage,
          `images/universal/${user.data.id}/profile-picture`,
        );

        new Compressor(imageUpload, {
          quality: 0.5,
          width: 300,
          mimeType: 'image/webp',
          success: async (profileImage) => {
            await uploadBytes(imageRef, profileImage);
          },
        });

        //The user gets a copy to their firebaseFolder
        let change = await doc(db, 'users', `${user.data.id}`);
        await updateDoc(change, {
          profilePic: `/images/universal/${user.data.id}/profile-picture`,
        });

        let getIt = await getDownloadURL(
          ref(storage, `/images/universal/${user.data.id}/profile-picture`),
        );
        setImageUrl(getIt);
      }

      setFormPassword('');
      setShow(!show);
    } else {
      toast.error('Password required to make changes');
    }
  };

  const loadUser = useCallback(async () => {
    let userRef = doc(db, 'users', user.data.id);
    let getUserDoc = await getDoc(userRef);
    await getUserDoc.data();

    try {
      let getIt = await getDownloadURL(
        ref(storage, `/images/universal/${user.data.id}/profile-picture`),
      );
      if (getIt) setImageUrl(getIt);
    } catch (error) {
      console.log(error);
      setImageUrl();
    }
  }, [user]);

  const auth = getAuth();

  useEffect(() => {
    if (user && user.data && auth) {
      loadUser();
      setFormName(user.name);
      setFormEmail(auth.currentUser.email);
      setImageUrl(`/images/universal/${user.data.id}/profile-picture`);
    }
  }, [user, auth, loadUser]);

  useEffect(() => {
    dispatch(getUser(userAuthObj));
  }, [dispatch, userAuthObj]);

  useEffect(() => {}, [show]);

  return (
    <Container className="mt-3">
      {user && user.data ? (
        <div style={{ marginTop: '5rem' }}>
          <Heading>My Profile</Heading>
          <div className="d-flex align-items-center mobile-profile">
            <div className="d-flex flex-column align-items-center">
              {imageUrl ? (
                <img src={imageUrl} alt="profile" className="profile-picture" />
              ) : (
                <img
                  src={profilePicImg}
                  alt="profile"
                  className="profile-picture"
                />
              )}
            </div>
            <div className="ms-3 my-3">
              <Heading size="md">Name: {formName}</Heading>
              <Heading size="md">Email: {formEmail}</Heading>
            </div>
          </div>
          <div className="mt-1 mx-auto">
            {!show ? (
              <Button
                variant="dark"
                onClick={() => setShow(!show)}
                disabled={show === true}>
                Edit Profile
              </Button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      ) : (
        <div></div>
      )}

      {show ? (
        <div className="mt-3">
          <h3>Profile Settings:</h3>

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Updated Display Name:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Display Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Updated Email address:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="profile-image">
              <Form.Label>Updated Profile Picture:</Form.Label>
              <Form.Control
                type="file"
                onChange={(event) => {
                  setImageUpload(event.target.files[0]);
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Enter Password to Confirm Changes:</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
            </Form.Group>

            <Button type="submit">Save Changes</Button>
            <Button variant="secondary" className="ms-3" onClick={handleCancel}>
              Cancel
            </Button>
          </Form>
        </div>
      ) : (
        <div></div>
      )}

      <div className="mt-3">
        {user && user.data ? (
          <Tab.Container id="left-tabs-example" defaultActiveKey="feed">
            <Row>
              <Col sm={3} className="mb-3">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="feed">Main Feed</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="designs">My Designs</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="followers">
                      {(user.followers && user.followers.length) || 0} Followers
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="following">
                      {(user.following && user.following.length) || 0} Following
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="favorites">
                      {(user.favorites && user.favorites.length) || 0} Favorites
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="feed">
                    <Heading className="text-center mb-2" size="xl">
                      Here's your feed
                    </Heading>
                    <FollowedArtists />
                  </Tab.Pane>
                  <Tab.Pane eventKey="designs">
                    <Heading className="text-center mb-2" size="xl">
                      Here are your {user.images.length || 0} designs!
                    </Heading>
                    <div className="d-flex flex-wrap align-items-center feedPostContainer">
                      {user.images.map((link, index) => {
                        return (
                          <PreviewPost
                            key={index}
                            data={link}
                            creator={user.name}
                          />
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="followers">
                    <Heading className="text-center mb-2" size="xl">
                      You have {user.followers.length || 0} followers:
                    </Heading>

                    <div className="d-flex flex-wrap justify-content-center">
                      {user.followers.map((user, idx) => {
                        return (
                          <div
                            key={idx + 'followers' + user.id}
                            className="me-3">
                            <FollowCard
                              profilePic={user.profilePic}
                              id={user.id}
                              name={user.name}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="following">
                    <Heading className="text-center mb-2" size="xl">
                      You are following {user.following.length || 0} artists:
                    </Heading>
                    <div className="d-flex flex-wrap justify-content-center">
                      {following.map((artist, idx) => {
                        return (
                          <div
                            key={idx + 'following' + user.id}
                            className="me-3">
                            <FollowCard
                              user={{
                                profilePic: artist.profilePic,
                                name: artist.name,
                                id: artist.data.id,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="favorites">
                    <Heading className="text-center mb-2" size="xl">
                      You have {(user.favorites && user.favorites.length) || 0}{' '}
                      favorites:
                    </Heading>
                    <div className="d-flex flex-wrap justify-content-center">
                      {user.favorites &&
                        user.favorites.map((design, idx) => {
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
          <h3>User is not logged in</h3>
        )}
      </div>
    </Container>
  );
};

export default Profile;
