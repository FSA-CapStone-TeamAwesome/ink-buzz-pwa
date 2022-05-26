import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Post from './Post';
import { Container, Form } from 'react-bootstrap';

export default function Search() {
  const [searchValue, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [notFound, setNotFound] = useState('')

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

  useEffect(()=>{
    setNotFound('')
    window.setTimeout(() => {setNotFound('No results found for that tag')}, 5000)
  }, [searchValue])

  useEffect(() => {
    setResults([]);
    lookUp();
  }, [searchValue, lookUp]);

  return (
    <Container className="mt-3">
      <Form>
        <Form.Control
          type="text"
          className='mb-4 border-bottom border border-secondary'
          placeholder="Search By Tag"
          value={searchValue}
          onChange={(evt) => {
            setNotFound('')
            setSearch(evt.target.value.toLowerCase());
          }}
          onSubmit={(evt)=> {
            evt.preventDefault()
            evt.stopImmediatePropagation()}}
        />
        {searchValue !== '' && results.length == 0 ?
       <h1>{notFound}</h1>
         :
        <div className="d-flex mb-3 flex-wrap justify-content-center align-items-center border-bottom">
          {
          results.map((nft) => {
            return <Post key={nft.id} data={nft} />;
          })}
        </div>}
      </Form>
    </Container>
  );
}
