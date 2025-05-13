// Firebase importlari
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

// Firebase ilovasini ishga tushirish
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login tekshiruvi (admin kirganmi yoki yo'qmi)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html'; // login sahifasiga qaytarish
  }
});

async function loadTests() {
  const testListContainer = document.getElementById("test-list");
  testListContainer.innerHTML = ''; // oldingi ma'lumotlarni tozalash

  try {
    const querySnapshot = await getDocs(collection(db, "tests"));

    if (querySnapshot.empty) {
      testListContainer.innerHTML = `<p class="text-gray-600">Hech qanday test topilmadi.</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      const testData = doc.data();
      const testItem = document.createElement("div");
      testItem.classList.add("p-4", "bg-white", "shadow-md", "rounded-lg", "mb-4");

      const testLink = `${window.location.origin}/take-test.html?testId=${doc.id}`;

      testItem.innerHTML = `
        <h3 class="text-xl font-bold">${testData.name}</h3>
        <p class="text-gray-700">${testData.description}</p>
        <div class="flex gap-2 mt-3">
          <button onclick="viewTest('${doc.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
            Savollarni ko'rish
          </button>
          <button onclick="addQuestions('${doc.id}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg">
            Savol qo'shish
          </button>
          <button onclick="copyLink('${testLink}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
            Linkni nusxalash
          </button>
        </div>
      `;

      testListContainer.appendChild(testItem);
    });

  } catch (error) {
    console.error("Testlarni yuklashda xatolik:", error);
    testListContainer.innerHTML = `<p class="text-red-600">Xatolik yuz berdi. Qayta urinib ko'ring.</p>`;
  }
}

// Linkni clipboardga nusxalash
function copyLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    alert("Test linki nusxalandi!");
  }).catch((err) => {
    console.error("Linkni nusxalashda xatolik:", err);
    alert("Linkni nusxalashda xatolik yuz berdi.");
  });
}


// Testga savol qo'shish sahifasiga o'tish
function addQuestions(testId) {
  window.location.href = `add-question.html?testId=${testId}`;
}

// Testni faqat ko‘rish sahifasiga o'tish
function viewTest(testId) {
  window.location.href = `show-test.html?testId=${testId}`;
}

// Yangi test yaratish sahifasiga o'tish
function createTest() {
  window.location.href = 'create-test.html';
}

// Chiqish funksiyasi
function logout() {
  signOut(auth)
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error("Chiqishda xatolik:", error);
    });
}

// Funksiyalarni global qilish
window.logout = logout;
window.createTest = createTest;
window.viewTest = viewTest;
window.addQuestions = addQuestions;
window.copyLink = copyLink;


// Sahifa yuklanganda testlarni yuklash
window.onload = loadTests;
