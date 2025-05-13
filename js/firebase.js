// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase konfiguratsiyasi (o'zingizning project ma'lumotlari bilan almashtiring)
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

// Firebase'ni ishga tushirish
const app = initializeApp(firebaseConfig);

// Auth va Firestore instance'larini olish
const auth = getAuth(app);
const db = getFirestore(app);

// Exportlar
export {
  auth,
  db,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
};
