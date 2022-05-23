import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Post from './Post';
import { Container, Form } from 'react-bootstrap';

export default function Search() {
  const [searchValue, setSearch] = useState('');
  const [results, setResults] = useState([]);

  const lookUp = useCallback(async () => {
    const q = query(
      collection(db, 'NFTs'),
      where('tags', 'array-contains', `${searchValue}`),
    );
    await onSnapshot(q, (querySnap) => {
      querySnap.forEach((doc) => {
        setResults((prev) => [...prev, doc.data()]);
      });
    });
  }, [searchValue]);

  useEffect(() => {
    setResults([]);
    lookUp();
  }, [searchValue, lookUp]);

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
        <div className="my-3">
          {results.map((nft) => {
            return <Post key={nft.id} data={nft} />;
          })}
        </div>
      </Form>
    </Container>
  );
}
