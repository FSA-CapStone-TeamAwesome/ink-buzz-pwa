import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Post from './Post';
import {db, storage} from '../config/firebase'
import { getStorage, ref, listAll } from "firebase/storage";
import { collection, doc, setDoc, query, orderBy, limit, where, getDocs, onSnapshot, loadBundle } from "firebase/firestore"
import { useAuthentication } from '../hooks/useAuthentication';




const Home =  () => {
  const [alphaList, setList] = useState([])
  const [newList, setNew] = useState([])

  const { user } = useAuthentication();
  const aFunction = async () => {
    let enterTheCollector =  await collection(db, 'NFTs')
    let docs =  await query(enterTheCollector,orderBy("name"), limit(5))

     await onSnapshot(docs, (querySnapshot) =>{
      querySnapshot.forEach((doc) =>{
        setList((prev) => [...prev, doc.data()])
      })
    })

    let newDocs = await query(enterTheCollector,orderBy("created", "desc"), limit(5))

    await onSnapshot(newDocs, (querySnapshot) => {
      querySnapshot.forEach((doc) =>{
        setNew((prev) => [...prev, doc.data()])
      })
    })


  }


  useEffect(()=>{
    aFunction()
  },[])



  if(!user){return <h2>Loading</h2>}
  return (
  <Container className="d-flex flex-column align-items-center my-3">
    <div className="text-center">
      <h1>Welcome to Ink Buzz!</h1>
      <h5>Check out some tattoo NFTs below</h5>
    </div>
    <div style={{display:'flex', flexWrap:'wrap', justifyContent:'space-around'}}>
      {alphaList.map((nft) => {
        return <Post key={nft.id} data={nft} />
      }
      )}
    </div>
    <h1 style={{textAlign:'center'}}>New Designs</h1>
    <div style={{display: 'flex', flexWrap:'wrap'}}>
    {newList.map((nft) => {
        return <Post key={nft.id} data={nft} />
      }
    )}
    </div>
  </Container>)
}

export default Home;
