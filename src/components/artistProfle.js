import React, { useState, useEffect } from "react";
import { Button, Container, Form, Tab, Row, Col, Nav } from "react-bootstrap";
import { assets } from "../constants";
import { toast } from "react-toastify";
import { injectStyle } from "react-toastify/dist/inject-style";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  arrayRemove,
} from "firebase/firestore";
import { db, storage } from "../config/firebase";
import { useDispatch, useSelector } from "react-redux";
import { getUser, updateUser } from "../store/userStore";
import {
  getAuth,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, useParams, Link as DOMLink } from "react-router-dom";
import PreviewPost from "./previewPost";
import { getProfile, clearProfile } from "../store/profileStore";
import { Heading, Link } from "@chakra-ui/react";

const ArtistProfile = () => {
  injectStyle();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const artist = useSelector((state) => state.profile.profile);
  const { profileId } = useParams();

  const [show, setShow] = useState(false);
  const [artistProfile, setArtistProfile] = useState(null);
  const [follows, setFollow] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [refresh, setRefresh] = useState(false);

  //function will follow/unfollow user
  const followToggle = async () => {
    console.log(user);
    console.log(artistProfile);
    const followRef = doc(db, "users", `${artistProfile.data.id}`);
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
            }),
          },
        })
      );

      await updateDoc(followRef, {
        followers: arrayRemove({
          name: user.name,
          id: user.data.id,
          profilePic: user.profilePic,
        }),
      });
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
            }),
          },
        })
      );
      await updateDoc(followRef, {
        followers: arrayUnion({
          name: user.name,
          id: user.data.id,
          profilePic: user.profilePic,
        }),
      });
      setFollow(true);
    }
  };

  const messageArtist = async () => {
    if (!follows) {
      followToggle();
    }
    navigate("/Chat");
  };

  async function getPhoto() {
    if (artistProfile && artistProfile.profilePic) {
      setPhoto();
      await getDownloadURL(ref(storage, artistProfile.profilePic))
        .then((url) => {
          setPhoto(url);
          console.log("when did this happen");
        })
        .catch((err) => {
          console.log(err);
        });
    }

    //checking if user has artist on follow
    if (
      artistProfile.data &&
      user.following &&
      user.following.some((item) => item.id === `${artistProfile.data.id}`)
    ) {
      setFollow(true);
    } else {
      setFollow(false);
    }
  }

  async function onPageLoad() {
    setPhoto(null)
    await dispatch(getProfile(profileId));

  }

  useEffect(() => {
    getPhoto();
  }, [artistProfile]);

  useEffect(() => {
    setArtistProfile(artist);
  }, [artist,]);

  useEffect(() => {
    onPageLoad();
  }, [profileId, follows]);

  return (
    <Container className="mt-3">
      {artistProfile && artist.data ? (
        <div>
          <div className="d-flex align-items-center">
            <div className="d-flex flex-column align-items-center">
              {photo ? (
                <img src={photo} alt="profile" className="profile-picture" />
              ) : (
                <img
                  src={assets.profilePic}
                  alt="profile"
                  className="profile-picture"
                />
              )}
            </div>
            <div className="ms-3">
              <Heading size="lg">{artistProfile.name}</Heading>
            </div>
          </div>
          <div className="d-flex">
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
                      {(artist.followers && artist.followers.length) || 0}{" "}
                      Followers
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="following">
                      {(artist.following && artist.following.length) || 0}{" "}
                      Following
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="favorites">
                      {(artist.favorites && artist.favorites.length) || 0}{" "}
                      Favorites
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="feed">
                    <h3>
                      {artist.name} has {artist.images.length || 0} Designs!
                    </h3>
                    <div className="d-flex flex-wrap justify-content-evenly align-items-center">
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
                  </Tab.Pane>
                  <Tab.Pane eventKey="followers">
                    <h3>
                      {artist.name} has {artist.followers.length || 0}{" "}
                      followers:
                    </h3>
                    <div className="d-flex flex-column">
                      {artist.followers.map((artist, idx) => {
                        if (artist.id === user.data.id) {
                          return (
                            <div className="w-50" key={"artist" + idx}>
                              <Button
                                onClick={() => navigate(`/profile`)}
                                className="mt-3"
                              >
                                {artist.name}
                              </Button>
                            </div>
                          );
                        }
                        return (
                          <div className="w-50" key={"artist" + idx}>
                            <Link
                              as={DOMLink}
                              onClick={() => {
                                dispatch(clearProfile())
                                setRefresh(!refresh);
                              }}
                              to={`/profiles/${artist.id}`}
                              className="mt-3"
                            >
                              {artist.name}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="following">
                    <h3>
                      {artist.name} is following {artist.following.length || 0}{" "}
                      artists:
                    </h3>
                    <div className="d-flex flex-column">
                      {artist.following.map((artist, idx) => {
                        if (artist.id === user.data.id) {
                          return (
                            <div className="w-50" key={"artist" + idx}>
                              <Link
                                as={DOMLink}
                                to={`/profile/`}
                                className="mt-3"
                              >
                                {artist.name}
                              </Link>
                            </div>
                          );
                        }

                        return (
                          <div className="w-50" key={"artist" + idx}>
                            <Link
                              as={DOMLink}
                              onClick={() => {
                                dispatch(clearProfile())
                                setRefresh(!refresh)}}
                              to={`/profiles/${artist.id}`}
                              className="mt-3"
                            >
                              {artist.name}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="favorites">
                    <h3>
                      {artist.name} has{" "}
                      {(artist.favorites && artist.favorites.length) || 0}{" "}
                      favorites:
                    </h3>
                    <div className="d-flex flex-column">
                      {artist.favorites &&
                        artist.favorites.map((design, idx) => {
                          return (
                            <div className="w-50" key={"design" + idx}>
                              <Button
                                onClick={() => navigate(`/nft/${design.id}`)}
                                className="mt-3"
                              >
                                {design.name}
                              </Button>
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
