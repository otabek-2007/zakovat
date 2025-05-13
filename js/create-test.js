// js/create-test.js
import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    collection,
    addDoc,
    serverTimestamp
  } from './firebase.js';
  
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'index.html';
    }
  });
  
  document.getElementById("create-test-form").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const testName = document.getElementById("test-name").value;
    const testDescription = document.getElementById("test-description").value;
  
    const newTest = {
      name: testName,
      description: testDescription,
      createdAt: serverTimestamp()
    };
  
    try {
      const docRef = await addDoc(collection(db, "tests"), newTest);
      alert("Test muvaffaqiyatli yaratildi!");
      window.location.href = `add-question.html?testId=${docRef.id}`;
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    }
  });
  
  window.logout = function () {
    signOut(auth)
      .then(() => {
        window.location.href = 'index.html';
      })
      .catch((error) => {
        console.error("Logout error: ", error);
      });
  }
  