import React from 'react';

import { auth, db, app } from "../config/firebase";

import { collection, addDoc, Timestamp } from "firebase/firestore";


const MessagesScreen = ({ navigation }) => {

  console.log(auth.currentUser)

  const recipient = 'L814iNPsM1h7WE99xnRi0v74zFI3'

  addDoc(collection(db,
    `messages/queue/${recipient}`),
    {artReference: null,
    content: "Yo and lo.",
    fromName: auth.currentUser.email,
    fromId: auth.currentUser.uid,
    photoUrl: null,
    timestamp: Timestamp.fromMillis(Date.now())})

  return (
    <h1>Chat</h1>
  );
};

export default MessagesScreen;
