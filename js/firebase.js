// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXJSvrT31Bss6bs-WJe_Hm1kyccip2P_4",
  authDomain: "sorovnoma-93601.firebaseapp.com",
  databaseURL: "https://sorovnoma-93601-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sorovnoma-93601",
  storageBucket: "sorovnoma-93601.appspot.com",
  messagingSenderId: "607837032856",
  appId: "1:607837032856:web:a6a3ba5f5d26f1d6d25bed",
  measurementId: "G-FY2HBSN1YP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  serverTimestamp
};
