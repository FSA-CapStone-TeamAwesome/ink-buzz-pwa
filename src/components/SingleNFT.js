import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import ListGroup from 'react-bootstrap/ListGroup';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot,  } from "firebase/firestore"
import { db, storage } from '../config/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
const SingleNFT = () => {
  const [data, setData] = useState(null)
  const [photo, setPhoto] = useState(null)

  let { nftId } = useParams();



  //function querys server for that Id and finds the right doc
  const aFunction = async () => {
    let docData = await query(collection(db, 'NFTs'), where('id', '==', `${nftId}`));
    await onSnapshot(docData, (query)=> {
      query.forEach((doc)=> {
        setData(doc.data())
      })
    })
  }

  async function getPhoto () {
    let getIt = await getDownloadURL(ref(storage, data.image))
    setPhoto(getIt)
  }


    useEffect(()=>{
      aFunction()
      getPhoto()
    },[])




  console.log(data)
  if(!data)return <h2>Loading</h2>
  const { id, name, creator, price, description, bids } = data;
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <h1>{name}</h1>
      <h4>Created by {creator}</h4>
      <Image fluid src={photo} />
      <h5 className="mt-3">${price}</h5>
      <p>{description}</p>
      <Button>Message Artist</Button>
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
