import React, { useEffect, useState, useCallback } from 'react';
import Post from './Post';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useSelector } from 'react-redux';

function Favorites() {
  const [favs, setFavs] = useState([]);

  const user = useSelector((state) => state.user.user);

  const loadsFavorites = useCallback(async () => {
    await user.favorites.forEach((element) => {
      let fav = query(collection(db, 'NFTs'), where('id', '==', `${element}`));
      onSnapshot(fav, (query) => {
        query.forEach((doc) => {
          setFavs((prev) => [...prev, doc.data()]);
        });
      });
    });
  }, [user]);

  useEffect(() => {
    loadsFavorites();
  }, [loadsFavorites]);

  return (
    <div>
      <h1>Favorites</h1>
      {favs.length === 0 ? (
        <h1>No Favorites </h1>
      ) : (
        favs.map((fav) => {
          return <Post key={fav.id} data={fav} />;
        })
      )}
    </div>
  );
}

export default Favorites;
