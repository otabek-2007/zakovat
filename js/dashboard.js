import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase konfiguratsiyasi
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

// Login tekshiruvi
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html';
  }
});

// Testlar ro'yxatini yuklash
function loadTests() {
  const testListContainer = document.getElementById("test-list");

  getDocs(collection(db, "tests"))
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const testData = doc.data();
        const testItem = document.createElement("div");
        testItem.classList.add("p-4", "bg-white", "shadow-md", "rounded-lg");

        testItem.innerHTML = `
          <h3 class="text-xl font-bold">${testData.name}</h3>
          <p>${testData.description}</p>
          <button onclick="viewTest('${doc.id}')" class="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">Ko'rish</button>
        `;

        testListContainer.appendChild(testItem);
      });
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });
}

function createTest() {
  window.location.href = 'create-test.html';
}

function viewTest(testId) {
  window.location.href = `add-question.html?testId=${testId}`;
}

function logout() {
  signOut(auth)
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error("Logout error: ", error);
    });
}

// Expose functions to global scope
window.logout = logout;
window.createTest = createTest;
window.viewTest = viewTest;

// Load tests on window load
window.onload = loadTests;
