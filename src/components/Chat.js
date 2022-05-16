import React, { useState, useEffect } from 'react';

import { Button } from 'react-bootstrap';

import { auth, db, app } from "../config/firebase";

import { useAuthentication } from '../hooks/useAuthentication';

import { document,
    getDocs,
   collection,
    addDoc,
    Timestamp,
    onSnapshot,
    query } from "firebase/firestore";


// chat2@chat.com
// YnK59v2GMRcRtFTZ7jlSXIaxu1G3

// chat1@chat.com
// JotxkdT73WZxdfVuw00itwp2GWr1

const Chat = ({ navigation }) => {

  const {user} = useAuthentication();

  const [myId, setMyId] = useState('');

  useEffect(() => {
    if (!myId && user){
      setMyId(user.uid)
    }
  })

  // if (user){

  //   console.log("we have user ino")
  //   console.log(user.email)
  // }


  // console.log(auth.currentUser)

  // const [myId, setId]

  // const myId = 'YnK59v2GMRcRtFTZ7jlSXIaxu1G3'


  const [message, setMessage] = useState({
    content: '',
    // Hardcoded, should change
    recipient: 'YnK59v2GMRcRtFTZ7jlSXIaxu1G3',
    photoUrl: '',
  });

  const sendMessage = async (evt) => {
    evt.preventDefault();

    try {
      await addDoc(collection(db,
        `messages/queue/${message.recipient}`),
        {artReference: null,
        content: message.content,
        fromName: auth.currentUser.email,
        fromId: auth.currentUser.uid,
        photoUrl: null,
        timestamp: Timestamp.fromMillis(Date.now())})
    } catch (err) {
      console.log("ERROR!")
      console.log(err);
    }

  }

  const fetchMessages = async () => {

    let queue;

    try {
      queue = query(collection(db, 'messages/queue', myId));

      const querySnapshot = await getDocs(queue);
        querySnapshot.forEach((doc) => {

        console.log(doc.id, " => ", doc.data());
        });


    } catch (err){
      console.log(err)
    }


    console.log("runnin", queue)

    const snapshot = await queue.get();

    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });

  }


  fetchMessages();


  return (
    <>
    <h1>Chat</h1>
    <form className="controls" onSubmit={sendMessage}>
        <input
          placeholder="message"
          type="content"
          value={message.content}
          onChange={(evt) => {
            setMessage( {...message, content: evt.target.value });
          }}
        />
        <Button type="submit">Send</Button>
      </form>

    {/* <Button variant="primary" onClick={sendMessage('New message.')}>
      Send Message
    </Button> */}
    </>
  );
};

export default Chat;
