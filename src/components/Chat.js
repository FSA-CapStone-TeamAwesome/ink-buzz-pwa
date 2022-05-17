import React, { useState, useEffect } from 'react';

import { Button } from 'react-bootstrap';

import { auth, db, app } from "../config/firebase";

import { useAuthentication } from '../hooks/useAuthentication';

import { useSelector, useDispatch } from 'react-redux'



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

// const dispatch = useDispatch()





const Chat = ({ navigation }) => {

  const user = useSelector((state) => state.user.user);

  // console.log("User is", user)

  const [myId, setMyId] = useState('JotxkdT73WZxdfVuw00itwp2GWr1');

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!myId && user){
      setMyId(user.uid)
    }
  })

  // const messageQueue = query(collection(db, 'messages/queue', myId));

  // const [messages] = useCollectionData(messageQueue, { idField: 'id' });

  const [message, setMessage] = useState({
    content: '',
    // Hardcoded, should change
    recipient: 'HaFb8KmFHZPUXvOyEe9lf2qRrJo2',
    photoUrl: '',
  });


  // Sending a message should place it in your queue folder as well


  const sendMessage = async (evt) => {
    evt.preventDefault();

    let timestamp = Timestamp.fromMillis(Date.now())

    try {


      await addDoc(collection(db,
        `messages/queue/${message.recipient}`),
        {artReference: null,
        content: message.content,
        fromName: auth.currentUser.email,
        fromId: auth.currentUser.uid,
        toId: message.recipient,
        photoUrl: null,
        timestamp })
    } catch (err) {
      console.log("ERROR!")
      console.log(err);
    } finally {
      try {
        await addDoc(collection(db,
          `messages/queue/${myId}`),
          {artReference: null,
          content: message.content,
          fromName: auth.currentUser.email,
          fromId: auth.currentUser.uid,
          toId: message.recipient,
          photoUrl: null,
          timestamp })
      } catch (err) {
        console.log(err);
      }

    }

  }

  const fetchMessages = async () => {

    let queue;

    try {
      queue = query(collection(db, 'messages/queue', myId));

      let messageHolder = []

      let querySnapshot = await getDocs(queue);

        querySnapshot.forEach((doc) => {

          messageHolder.push({
            id : doc.id,
            timestamp: doc.data().timestamp,
            from : doc.data().fromId,
            content: doc.data().content })
        // console.log(doc.data().fromName, " : ", doc.data().content);
      });

      setMessages(messageHolder);


    } catch (err){
      console.log(err)
    }

  }

  console.log(messages)
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

    <Button variant="primary" onClick={fetchMessages}>
      Get Messages
    </Button>

    {messages && messages.map(msg => {

    if (msg.from === myId){
      return <div style={{display: 'flex', justifyContent:'flex-end'}} key={msg.id}>{msg.content}</div>
    } else {

      return <div style={{display: 'flex', justifyContent:'flex-start'}} key={msg.id}>{msg.content}</div>

    }



    })}

    </>
  );
};

export default Chat;
