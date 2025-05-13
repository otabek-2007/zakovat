import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBXJSvrT31Bss6bs-WJe_Hm1kyccip2P_4",
  authDomain: "sorovnoma-93601.firebaseapp.com",
  projectId: "sorovnoma-93601",
  storageBucket: "sorovnoma-93601.appspot.com",
  messagingSenderId: "607837032856",
  appId: "1:607837032856:web:a6a3ba5f5d26f1d6d25bed",
  measurementId: "G-FY2HBSN1YP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get("testId");

async function loadTest() {
  if (!testId) {
    alert("Test ID topilmadi");
    return;
  }

  const testDocRef = doc(db, "tests", testId);
  const testSnap = await getDoc(testDocRef);

  if (testSnap.exists()) {
    const testData = testSnap.data();
    document.getElementById("test-name").textContent = testData.name;
    document.getElementById("test-description").textContent = testData.description;

    const questionsSnap = await getDocs(collection(db, `tests/${testId}/questions`));
    const listContainer = document.getElementById("question-list");

    if (questionsSnap.empty) {
      listContainer.innerHTML = "<p>Savollar topilmadi.</p>";
      return;
    }

    questionsSnap.forEach((questionDoc) => {
      const qData = questionDoc.data();
      const item = document.createElement("div");
      item.classList.add("p-4", "bg-white", "rounded", "shadow");

      // Yangi maydonlar
      item.innerHTML = `
        <p class="font-semibold">${qData.questionText ?? 'Savol matni yo‘q'}</p>
        <p class="text-sm text-gray-600">Ball: ${qData.points ?? 0}</p>
        <p class="text-sm text-gray-600">To‘g‘ri javob: ${qData.correctAnswer ?? 'Belgilangan emas'}</p>
      `;

      // Agar javoblar mavjud bo‘lsa
      if (qData.answers && qData.answers.length > 0) {
        const answersList = document.createElement("ul");
        qData.answers.forEach((answer, index) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${index + 1}. ${answer}`;
          answersList.appendChild(listItem);
        });
        item.appendChild(answersList);
      }

      listContainer.appendChild(item);
    });

  } else {
    alert("Test topilmadi");
  }
}

window.onload = loadTest;
