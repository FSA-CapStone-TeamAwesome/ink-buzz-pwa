import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import PreviewPost from './previewPost';
import { useSelector } from 'react-redux';

const FollowedArtists = () => {
  const [following, setFollow] = useState([]);
  const [profile, setProfile] = useState(null);
  const user = useSelector((state) => state.user.user);
  const followingState = useSelector((state) => state.following.following);

  //loader looks for user based on name, this will be changed to ID
  function loader() {
    if (followingState[0] === undefined) {
      setFollow([]);
    }
    setFollow(followingState);
  }

  useEffect(() => {
    setProfile(user);
  }, []);

  useEffect(() => {
    loader();
  }, [followingState]);

  if (!following[0]) {
    return <h3>Loading</h3>;
  }

  return (
    <div>
      <h1>Here's the latest from your favorites.</h1>
      <h2>A Quick Five from your Faves</h2> <br />
      {following.map((coolDude) => {
        return (
          <div>
            <h2>{coolDude.name}</h2><br />

            {coolDude.images ? (
               <div className="d-flex flex-wrap justify-content-evenly align-items-center">{
              coolDude.images.map((link, index) => {
                if(index >= coolDude.images.length-5){
                return <PreviewPost key={index} data={link} creator={coolDude.name} />;
                }
              })}
              </div>
            ) : (
              <></>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default FollowedArtists;
