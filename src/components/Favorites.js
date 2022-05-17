import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Post from './Post';
import {db} from '../config/firebase'
import { collection,  query, where, onSnapshot} from "firebase/firestore"
import { useAuthentication } from '../hooks/useAuthentication';
import Search from './SearchBar';
import { useSelector } from 'react-redux';

function Favorites () {
  const [favs, setFavs] = useState([])
  const [userProfile, setUser] = useState(null)

  const user = useSelector((state) => state.user.user);

  async function loadsFavorites() {
    console.log(user)
    await user.favorites.forEach(element => {
      let fav = query(collection(db, 'NFTs'), where('id', '==', `${element}`))
      onSnapshot(fav, (query) => {
        query.forEach((doc) => {
          setFavs((prev) => [...prev, doc.data()])
        })
      })
    });
  }



  useEffect(() => {

  }, [])

  useEffect(()=> {
  setUser((user))
  loadsFavorites()
}, [user])

console.log(favs)
return (
  <div>
    <h1>Favorites</h1>
    {favs.length === 0 ? <h1>No Favorites </h1> :
    favs.map((fav, index) => {
      return <Post key={fav.id} data={fav} />
    })}
  </div>
)}

export default Favorites
