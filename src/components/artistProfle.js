import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Tab, Row, Col, Nav } from 'react-bootstrap';
import { assets } from '../constants';
import { toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, arrayRemove, onSnapshot, where, query } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, updateUser } from '../store/userStore';
import {
  getAuth,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate, useParams } from 'react-router-dom';
import PreviewPost from './previewPost';
import { getProfile } from '../store/profileStore';

const ArtistProfile = () => {
  injectStyle()
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const user = useSelector((state) => state.user.user);
  const artist = useSelector((state) => state.profile.profile)
  const { profileId } = useParams();

  const [show, setShow] = useState(false)
  const [artistProfiile, setArtistProfile] = useState(null)
  const [follows, setFollow] = useState(false);
  const [photo, setPhoto] = useState(null);





  //function will follow/unfollow user
  const followToggle = async () => {
    const followRef = doc(db,'users', `${artistProfiile.id}`)

    //for removing from followers/following
    if(user.following && user.following.some(item => item.id ===`${user.id}`)){
      dispatch(updateUser({
        user,
        update: {
          following: arrayRemove({
          id: artistProfiile.id,
          name: artistProfiile.name
        })
      }
      })
      )


    await updateDoc((followRef), {
        followers: arrayRemove({
          name: user.name,
          id: user.data.id,
          profilePic: user.profilePic
        })
      })
      setFollow(false)
  }
  //for adding to followers/following
   else {
    dispatch(updateUser({
      user,
      update: {
        following: arrayUnion({
          id: artistProfiile.id,
          name: artistProfiile.name
      })
      }
    }))
    await updateDoc((followRef), {
      followers: arrayUnion({
        name: user.name,
        id: user.data.id,
        profilePic: user.profilePic
      })
    })
    setFollow(true)
  }}


  const messageArtist = async () =>{
    if(!follows){
      followToggle()
    }
    navigate('/Chat')
  }

  async function getPhoto() {
    console.log(artistProfiile)
    let getIt = await getDownloadURL(ref(storage, artistProfiile.image));
    setPhoto(getIt);

    //checking if user has artist on follow
    if (user.following && user.following.some(item => item.id ===`${artistProfiile.data.id}`)) {
      setFollow(true);
    } else {
      setFollow(false);
    }

  }



  useEffect(() => setArtistProfile(artist), [artist]);



  useEffect(() => {
    dispatch(getProfile(profileId))
    getPhoto()
  }, []);


  console.log(artist)
  return (
    <Container className="mt-3">

      {artist && artist.data ? (
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

            </div>
          </div>
          <div className="d-flex">
          <Button className="me-3" onClick={()=> messageArtist()}>Message Artist</Button>
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
        {artist && artist.data ? (
          <Tab.Container id="left-tabs-example" defaultActiveKey="feed">
            <Row>
              <Col sm={3} className="mb-3">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="feed">Main Feed</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="followers">
                      {(artist.followers && artist.followers.length) || 0} Followers
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="following">
                      {(artist.following && artist.following.length) || 0} Following
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="favorites">
                      {(artist.favorites && artist.favorites.length) || 0} Favorites
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="feed">
                    <h3>{artist.name} has {artist.images.length || 0} Designs!</h3>
                    <div className="d-flex flex-wrap justify-content-evenly align-items-center">
                    {artist.images.map((link, index) => {

                      return <PreviewPost key={index} data={link} creator={artist.name} />;
                    })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="followers">
                    <h3>{artist.name} has {artist.followers.length || 0} followers:</h3>
                    <div className="d-flex flex-column">
                      {artist.followers.map((artist, idx) => {
                        if(artist.id === user.data.id){
                         return <div className="w-50" key={'artist' + idx}>
                          <Button onClick={()=> navigate(`/profile`)} className="mt-3">{artist.name}</Button>
                        </div>
                        }
                        return (
                          <div className="w-50" key={'artist' + idx}>
                            <Button onClick={()=> navigate(`/profiles/${artist.id}`)} className="mt-3">{artist.name}</Button>
                          </div>
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="following">
                    <h3>
                      {artist.name} is following {artist.following.length || 0} artists:
                    </h3>
                    <div className="d-flex flex-column">
                      {artist.following.map((artist, idx) => {
                        return (
                          <div className="w-50" key={'artist' + idx}>
                            <Button onClick={()=> navigate(`/profiles/${artist.id}`)} className="mt-3">{artist.name}</Button>
                          </div>
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="favorites">
                    <h3>
                      {artist.name} has {(artist.favorites && artist.favorites.length) || 0}{' '}
                      favorites:
                    </h3>
                    <div className="d-flex flex-column">
                      {artist.favorites &&
                        artist.favorites.map((design, idx) => {
                          return (
                            <div className="w-50" key={'design' + idx}>
                              <Button
                                onClick={() => navigate(`/nft/${design.id}`)}
                                className="mt-3">
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






}

export default ArtistProfile