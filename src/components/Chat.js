import React, { useState, useEffect } from 'react';

import { Button } from 'react-bootstrap';

import { auth, db, app } from "../config/firebase";

import { collection, addDoc, Timestamp } from "firebase/firestore";


const Chat = ({ navigation }) => {

  // console.log(auth.currentUser)

  const [message, setMessage] = useState({
    content: '',
    recipient: '',
    photoUrl: '',
  });


  const recipient = 'L814iNPsM1h7WE99xnRi0v74zFI3'

  const sendMessage = async (evt) => {

    evt.preventDefault();
    console.log(evt.target.value)

    try {
      await addDoc(collection(db,
        `messages/queue/${recipient}`),
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
