import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Post from './Post';
import {db, storage} from '../config/firebase'
import { getStorage, ref, listAll } from "firebase/storage";
import { collection, doc, setDoc, query, orderBy, limit, where, getDocs, onSnapshot, loadBundle } from "firebase/firestore"
import { useAuthentication } from '../hooks/useAuthentication';

const Home =  () => {
  const [list, setList] = useState([])
  const [reload, setLoad] = useState(false)
  const { user } = useAuthentication();
  console.log(user)
  const aFunction = async () => {
    let enterTheCollector =  await collection(db, 'NFTs')
    let docs =  await query(enterTheCollector,orderBy("name"), limit(3))
    let quick = []
     await onSnapshot(docs, (querySnapshot) =>{
      querySnapshot.forEach((doc) =>{
        quick.push(doc.data())
      })
    })
    setList(quick)

  }

  const loads = () => {
    setLoad(true)
  }

  useEffect(()=>{
    aFunction()
  },[])

  console.log(list)
  if(!user){return <h2>Too bad</h2>}
  return (
  <Container className="d-flex flex-column align-items-center my-3">
    <div className="text-center">
      <h1>Welcome to Ink Buzz!</h1>
      <h5>Check out some tattoo NFTs below</h5>
    </div>
    <div>
      {list.length ? list.map((nft) => {
        console.log(nft)
        return <Post key={nft.id} data={nft} />
      })
      : <>doop</>}
    </div>
  </Container>)
}

export default Home;
