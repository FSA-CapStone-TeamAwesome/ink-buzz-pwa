import React, { useState, useEffect } from "react";
import {db, storage} from '../config/firebase'
import { getStorage, ref, listAll } from "firebase/storage";
import { collection, doc, setDoc, query, orderBy, limit, where, getDocs, onSnapshot, loadBundle } from "firebase/firestore"
import Post from './Post';

export default function Search () {
  const [searchValue, setSearch] = useState('')
  const [results, setResults] = useState([])

   const lookUp = async() => {
    const q = query(collection(db, 'NFTs'), where("tags", "array-contains", `${searchValue}`));
    await onSnapshot(q, (querySnap) => {
      querySnap.forEach((doc) => {
        console.log(doc.data())
        setResults((prev) => [...prev, doc.data()])
      })
    })
   }

   useEffect(()=>{
     setResults([])
     lookUp()
   },[searchValue])

  return (
    <div>
    <input type='text' placeholder="Search By Tag" value={searchValue}
    onChange={(evt)=> setSearch(evt.target.value)}></input>
    <div>
    <h2>Search Results</h2>
    {results.map((nft) => {
        return <Post key={nft.id} data={nft} />
      })
        }
    </div>
    </div>
  )
}
