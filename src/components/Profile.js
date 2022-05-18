import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Tab, Row, Col, Nav } from 'react-bootstrap';
import { assets } from '../constants';
import { toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
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
import { useNavigate } from 'react-router-dom';


const Profile = () => {
  injectStyle();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [imageUpload, setImageUpload] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');

  const handleShow = () => {
    setShow(!show);
  };

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
              console.log('update email error');
              console.log(error);
            });
        })
        .catch((error) => {
          toast.error('Incorrect Password!');
          console.log('wrong password');
          console.log(error);
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
        await uploadBytes(imageRef, imageUpload);

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

  const loadUser = async () => {
    let userRef = doc(db, 'users', user.data.id);
    let getUser = await getDoc(userRef);
    let userInfo = await getUser.data();
    let getIt = await getDownloadURL(
      ref(storage, `/images/universal/${user.data.id}/profile-picture`),
    );
    if (getIt) setImageUrl(getIt);
  };

  const auth = getAuth();

  useEffect(() => {
    if (user && user.data && auth) {
      loadUser();
      setFormName(user.name);
      setFormEmail(auth.currentUser.email);
      setImageUrl(`/images/universal/${user.data.id}/profile-picture`);
    }
  }, [user]);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {}, [show]);

  return (
    <Container className="mt-3">
      <h1>My Profile</h1>
      {user && user.data ? (
        <div>
          <div className="d-flex align-items-center">
            <div className="d-flex flex-column align-items-center">
              {imageUrl ? (
                <img src={imageUrl} alt="profile" className="profile-picture" />
              ) : (
                <img
                  src={assets.person01}
                  alt="profile"
                  className="profile-picture"
                />
              )}
            </div>
            <div className="ms-3">
              <h3>Name: {formName}</h3>
              <h3>Email: {formEmail}</h3>
            </div>
          </div>
          <div className="mt-1 mx-auto">
            {!show ? (
              <Button
                variant="dark"
                onClick={handleShow}
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
                    <Nav.Link eventKey="followers">{(user.followers && user.followers.length) || 0}  Followers</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="following">
                      {(user.following && user.following.length) || 0} Following
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="favorites">{(user.favorites && user.favorites.length) || 0}  Favorites</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="feed">
                    <h3>Here's your feed</h3>
                  </Tab.Pane>
                  <Tab.Pane eventKey="followers">
                  <h3>
                      You have {user.followers.length || 0} followers:
                    </h3>
                    <div className="d-flex flex-column">
                      {user.followers.map((user, idx) => {
                        return (
                          <div className="w-50" key={'user' + idx}>
                            <Button className="mt-3">{user.name}</Button>
                          </div>
                        );
                      })}
                      </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="following">
                    <h3>
                      You are following {user.following.length || 0} artists:
                    </h3>
                    <div className="d-flex flex-column">
                      {user.following.map((artist, idx) => {
                        return (
                          <div className="w-50" key={'artist' + idx}>
                            <Button className="mt-3">{artist.name}</Button>
                          </div>
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="favorites">
                    <h3>You have {user.favorites.length || 0} favorites:</h3>
                    <div className="d-flex flex-column">
                      {user.favorites.map((design, idx) => {
                        return (
                          <div className="w-50" key={'design' + idx}>
                            <Button onClick={()=> navigate(`/nft/${design.id}`)}className="mt-3">{design.name}</Button>
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
