import React, { useState, useEffect } from 'react';
import { db, storage } from '../config/firebase';
import { getStorage, ref, listAll } from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  onSnapshot,
  loadBundle,
} from 'firebase/firestore';
import Post from './Post';
import { Container, Form } from 'react-bootstrap';

export default function Search() {
  const [searchValue, setSearch] = useState('');
  const [results, setResults] = useState([]);

  const lookUp = async () => {
    const q = query(
      collection(db, 'NFTs'),
      where('tags', 'array-contains', `${searchValue}`),
    );
    await onSnapshot(q, (querySnap) => {
      querySnap.forEach((doc) => {
        setResults((prev) => [...prev, doc.data()]);
      });
    });
  };

  useEffect(() => {
    setResults([]);
    lookUp();
  }, [searchValue]);

  return (
    <Container className="mt-3">
      <Form>
        <Form.Control
          type="text"
          placeholder="Search By Tag"
          value={searchValue}
          onChange={(evt) => {
            setSearch(evt.target.value.toLowerCase());
          }}
        />
        <div className="mb-3">
          {results.map((nft) => {
            return <Post key={nft.id} data={nft} />;
          })}
        </div>
      </Form>
    </Container>
  );
}
