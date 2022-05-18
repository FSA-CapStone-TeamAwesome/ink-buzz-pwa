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
    query,
    orderBy,
    limit } from "firebase/firestore";


// chat2@chat.com
// YnK59v2GMRcRtFTZ7jlSXIaxu1G3
// 0xb936376169B6E0593922611F64A6B46b847cb262

// chat1@chat.com
// JotxkdT73WZxdfVuw00itwp2GWr1
// 0xd18ac37aAbA82aAdBfC8BFD6fEF8A42DF1c28352

// const dispatch = useDispatch()

// This global variable will be replaced with a converation list


const convoList = [
  {name: 'Person 1',
  uid: 'HaFb8KmFHZPUXvOyEe9lf2qRrJo2'},
  {name: 'Person 2',
  uid: 'YnK59v2GMRcRtFTZ7jlSXIaxu1G3'},
  {name: 'Person 3',
  uid: 'JotxkdT73WZxdfVuw00itwp2GWr1'}
]











const Chat = ({ navigation }) => {


  const { user } = useAuthentication()

  const [myId, setMyId] = useState('')

  const [myName, setMyName] = useState('')

  const [interlocutor, setInterlocutor] = useState('')

  // console.log("User is", user)

  const [messages, setMessages] = useState([]);


  useEffect(()=> {
    if (user){
      console.log("auth user", user)
      setMyId(user.uid)
      setMyName(user.email)
    }
  }, [user])

  useEffect(() => {
    if (myId){

      const unsub = onSnapshot(collection(db, 'messages/queue', myId), (snapshot) => {

        // snapshot.docs.map(doc => console.log("From effect.", doc.data()))

        setMessages(snapshot.docs.map(doc => doc.data()))

      })
      return unsub
    }

  })


  // const messageQueue = query(collection(db, 'messages/queue', myId));

  // const [messages] = useCollectionData(messageQueue, { idField: 'id' });

  const [message, setMessage] = useState({
    content: '',
    // Hardcoded, should change
    recipient: interlocutor,
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
        fromName: myName,
        fromId: myId,
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
          fromName: myName,
          fromId: myId,
          toId: message.recipient,
          photoUrl: null,
          timestamp })

        // fetchMessages()
      } catch (err) {
        console.log(err);
      }

    }

  }

  const fetchMessages = async () => {
    let queue;
    try {
      queue = query(
        collection(db, 'messages/queue', myId),
       orderBy("timestamp"),
        limit(50));

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


  return (
    <>
    <h1>Chat</h1>
    <div id="conversations">
    {convoList.map(conversation => {
      return (

      <Button key={conversation.uid} style={{margin: 10}} variant="primary" onClick={() => setInterlocutor(conversation.uid)}>
      {conversation.name}
    </Button>)
    })}

    <Button style={{margin: 10}} variant="primary" onClick={() => setInterlocutor('')}>
      No One
    </Button>
    </div>

    <Button variant="primary" onClick={fetchMessages}>
      Get Messages
    </Button>

    {messages && messages.map(msg => {

    if (msg.fromId === myId){
      return <div style={{display: 'flex', justifyContent:'flex-end'}} key={msg.id}>{msg.content}</div>
    } else if (msg.fromId === interlocutor) {
      return <div style={{display: 'flex', justifyContent:'flex-start'}} key={msg.id}>{msg.content}</div>
    } else {
      return <div>Who you want to talk to?</div>
    }
    })}

    <form className="controls" style={{display: 'flex', justifyContent:'flex-end'}} onSubmit={sendMessage}>
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
    </>
  );
};

export default Chat;
