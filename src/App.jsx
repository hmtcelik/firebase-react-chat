import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCahbDYNAvX5unr5swLCxFRLLd6vIWfVGU",
  authDomain: "chat-app-5dd64.firebaseapp.com",
  projectId: "chat-app-5dd64",
  storageBucket: "chat-app-5dd64.appspot.com",
  messagingSenderId: "474562972718",
  appId: "1:474562972718:web:a7bf1be702e8b0cd1d63bf",
  measurementId: "G-S1QT18ZB9C",
};
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-screen">
      <header className="flex justify-between border-b p-2 mb-4">
        <h1 className="text-2xl">Sohbet Uygulamasi</h1>
        {user && <SignOut />}
      </header>

      {user ? (
        <>
          <MessageList />
          <MessageForm />
        </>
      ) : (
        <SignIn />
      )}
    </div>
  );
}

function SignIn() {
  function handleClick() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className="bg-blue-500 p-2 text-white rounded-lg"
      >
        Google ile Giris Yap
      </button>
    </div>
  );
}

function SignOut() {
  return (
    <button
      onClick={() => signOut(auth)}
      className="bg-red-500 p-2 text-white rounded-lg"
    >
      Cikis Yap
    </button>
  );
}

function MessageList() {
  const messagesRef = collection(db, "messages");
  const [messages] = useCollection(query(messagesRef, orderBy("createdAt")));

  const listEndRef = useRef();

  useEffect(() => {
    listEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages?.docs]);

  return (
    <div className="overflow-y-auto h-full space-y-2 px-2">
      {messages?.docs.map((d) => (
        <MessageItem key={d.id} data={d.data()} />
      ))}
      <div ref={listEndRef}></div>
    </div>
  );
}

function MessageItem(props) {
  const { text, userPhoto, userUid } = props.data;
  const reverseClass =
    auth.currentUser.uid === userUid ? "flex-row-reverse" : "";

  return (
    <div className={`flex ${reverseClass} items-center gap-1 w-full`}>
      <img src={userPhoto} className="w-10 h-10 rounded-full" />
      <div className="bg-gray-200 p-2 rounded-full">{text}</div>
    </div>
  );
}

function MessageForm() {
  const messagesRef = collection(db, "messages");

  const [inputText, setInputText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    setDoc(doc(messagesRef), {
      text: inputText,
      createdAt: serverTimestamp(),
      userUid: auth.currentUser.uid,
      userPhoto: auth.currentUser.photoURL,
    });

    setInputText("");
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        <input
          type="text"
          className="border border-gray-500 rounded-lg p-2 w-full"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 p-2 text-white rounded-lg">
          Gonder
        </button>
      </form>
    </div>
  );
}

export default App;
