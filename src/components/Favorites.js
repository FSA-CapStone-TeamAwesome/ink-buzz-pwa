import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Post from './Post';
import {db, storage} from '../config/firebase'
import { getStorage, ref, listAll } from "firebase/storage";
import { collection, doc, setDoc, getDoc, query, orderBy, limit, where, getDocs, onSnapshot, loadBundle } from "firebase/firestore"
import { useAuthentication } from '../hooks/useAuthentication';
import Search from './SearchBar';


export default function Favorites () {
  const [favs, setFavs] = useState([])
  const [userProfile, setUser] = useState(null)
  const { user } = useAuthentication();
  useEffect(() => {

  }, [])

  async function loadFunction () {
    let userRef = doc(db, 'users', user.auth.currentUser.uid)
    let getUser = await getDoc(userRef)
    let userInfo = await getUser.data()
    setUser((userInfo))
  }


return (
  <div>





  </div>
)

}
