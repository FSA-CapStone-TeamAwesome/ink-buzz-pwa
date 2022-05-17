import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import ListGroup from 'react-bootstrap/ListGroup';
import { useParams } from 'react-router-dom';
import { collection, doc, query, where, onSnapshot, updateDoc, arrayUnion, getDoc, getDocs, arrayRemove,  } from "firebase/firestore"
import { useDispatch, useSelector } from 'react-redux';
import { db, storage } from '../config/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { useAuthentication } from '../hooks/useAuthentication';
import { updateUser } from '../store/userStore';
const SingleNFT = () => {
  const [data, setData] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [follows, setFollow] = useState(false)
  const [userProfile, setUser] = useState(null)
  const [favored, setFavor] = useState(null)
  const { nftId } = useParams();
  const user = useSelector((state) => state.user.user);

  const dispatch = useDispatch()


  //function querys server for that Id and finds the right doc for the NFT, causes the rest of the doc to render
  const aFunction = async () => {
    let docData = await query(collection(db, 'NFTs'), where('id', '==', `${nftId}`));
    await onSnapshot(docData, (query)=> {
      query.forEach((doc)=> {
        setData(doc.data())
      })
    })
  }

  //function that loads photo
  async function getPhoto () {
    let getIt = await getDownloadURL(ref(storage, data.image))
    setPhoto(getIt)
    if(user.following && user.following.includes(`${data.creator}`)){
      setFollow(true)
    }
    else {setFollow(false)}
    if(user.favorites && user.favorites.includes(data.id)){
      setFavor(true)
    }
    else {setFavor(false)}
  }


  //function for toggling the state of following an artist
  const followToggle = async () => {
    if(userProfile.following && userProfile.following.includes(`${data.creator}`)){
      dispatch(updateUser({
        user,
        update: {following: arrayRemove(
            data.creator,
          )}
        }))
      setFollow(false)
  }
   else {
    dispatch(updateUser({
      user,
      update: {
        following: arrayUnion(
          data.creator,
        )
      }
    }))
    setFollow(true)
  }}


  const favorToggle = async () => {
    if(userProfile.favorites && userProfile.favorites.includes(`${data.id}`)){
      dispatch(updateUser({
        user,
        update: {
          favorites: arrayRemove(
            data.id
            )
        }
      }))
      setFavor(false)

    }
    else {
      dispatch(updateUser({
        user,
        update: {
        favorites: arrayUnion(
          data.id
        )}
      }))
      setFavor(true)
  }}

    useEffect(()=>{
      aFunction()
    },[])

    useEffect(()=>{
      getPhoto()
    },[data])

    useEffect(()=>
    setUser((user)),
    [user])




  if(!data)return <h2>Loading</h2>
  const { id, name, creator, price, description, bids } = data;
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <h1>{name}</h1>
      <h4>Created by {creator}</h4>
      <Image fluid style={{height: '400px'}} src={photo} />
      <h5 className="mt-3">${(price/100).toFixed(2)}</h5>
      <p>{description}</p>
      <div style={{display:'flex'}}>
      <Button>Message Artist</Button>
      {favored ?
      <Button onClick={favorToggle}>Unfavorite</Button> :
      <Button onClick={favorToggle}>Favorite It</Button>}
      {follows ?
      <Button onClick={followToggle}>Unfollow Artist</Button> : <Button onClick={followToggle}>Follow Artist</Button>
      }
      </div>
      <h5 className="mt-3">Current Bids</h5>
      {bids ?
      <ListGroup className="my-2">
        {
          bids.sort((a, b) => b.price - a.price)
          .map((bid) => {
            return (
              <ListGroup.Item key={bid.id} className="text-center">
                <div>On {bid.date}</div>
                <div>
                  {bid.name} bid ${bid.price.toFixed(2)}
                </div>
              </ListGroup.Item>
            );
          })}
      </ListGroup>
      : <></>}
    </Container>
  );
};

export default SingleNFT;
