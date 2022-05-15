import React, { useState, useEffect } from 'react';

import { Button } from 'react-bootstrap';

import { auth, db, app } from "../config/firebase";

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { confirmPasswordReset } from 'firebase/auth';

// chat2@chat.com
// YnK59v2GMRcRtFTZ7jlSXIaxu1G3

// chat1@chat.com
// JotxkdT73WZxdfVuw00itwp2GWr1

const Chat = ({ navigation }) => {

  // console.log(auth.currentUser)

  const [message, setMessage] = useState({
    content: '',
    // Hardcoded, should change
    recipient: 'YnK59v2GMRcRtFTZ7jlSXIaxu1G3',
    photoUrl: '',
  });

  const sendMessage = async (evt) => {
    evt.preventDefault();
    console.log(evt.target.value)

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

    const queue = collection(db, 'messages');



    console.log("runnin", queue)

    const snapshot = await queue.get();


    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });

  }

  console.log("R")

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
