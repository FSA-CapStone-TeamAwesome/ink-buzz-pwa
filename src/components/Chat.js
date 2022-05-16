import React, { useState, useEffect } from 'react';

import { Button } from 'react-bootstrap';

import { auth, db, app } from "../config/firebase";

import { useAuthentication } from '../hooks/useAuthentication';

import { useCollectionData } from 'react-firebase-hooks/firestore';

import { document,
    getDocs,
    collection,
    addDoc,
    Timestamp,
    onSnapshot,
    query } from "firebase/firestore";


// chat2@chat.com
// YnK59v2GMRcRtFTZ7jlSXIaxu1G3
// 0xb936376169B6E0593922611F64A6B46b847cb262

// chat1@chat.com
// JotxkdT73WZxdfVuw00itwp2GWr1
// 0xd18ac37aAbA82aAdBfC8BFD6fEF8A42DF1c28352

const Chat = ({ navigation }) => {

  const { user } = useAuthentication();

  const [myId, setMyId] = useState('JotxkdT73WZxdfVuw00itwp2GWr1');

  useEffect(() => {
    if (!myId && user){
      setMyId(user.uid)
    }
  })

  const messageQueue = await query(collection(db, 'messages/queue', myId));

  const [messages] = useCollectionData(messageQueue, { idField: 'id' });

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
        toId: message.recipient,
        photoUrl: null,
        timestamp: Timestamp.fromMillis(Date.now())})
    } catch (err) {
      console.log("ERROR!")
      console.log(err);
    }

  }

  // const fetchMessages = async () => {

  //   let queue;

  //   try {
  //     queue = query(collection(db, 'messages/queue', myId));

  //     const querySnapshot = await getDocs(queue);
  //       querySnapshot.forEach((doc) => {

  //       console.log(doc.id, " => ", doc.data());
  //       });


  //   } catch (err){
  //     console.log(err)
  //   }


  //   console.log("runnin", queue)

  //   // const snapshot = await queue.get();

  //   // snapshot.forEach(doc => {
  //   //   console.log(doc.id, '->', doc.data());
  //   // });

  // }


  // fetchMessages();




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
