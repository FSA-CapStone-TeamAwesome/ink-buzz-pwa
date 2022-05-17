import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where

} from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import Post from './Post';
import { useSelector} from 'react-redux';

const FollowedArtists = () => {
  const [following, setFollow] = useState([])
  const [profile, setProfile] = useState(null)
  const user = useSelector((state) => state.user.user);
  const followingState = useSelector((state) => state.following.following)

  //loader looks for user based on name, this will be changed to ID
  function loader () {
      if(followingState[0] === undefined){setFollow([])}
      setFollow(followingState)}

  useEffect(() => {
    setProfile(user)
  }, [])

  useEffect(() => {
    loader()
  }, [user])



  if(!following[0]) {return <h3>Loading</h3>}
  return (
    <div>
    <h1>Here's the latest from your favorites.</h1>
    <h2>A Quick Five from your Faves</h2>
    {following.map((coolDude) => {
      return (<div>
      <h2>{coolDude}</h2>
      {coolDude.links ?
      coolDude.links.map((link, index) => {
        return <Post key={index} data={link} />
      }) : <></>}
      </div>)
    })}
    </div>
  )

}
export default FollowedArtists
