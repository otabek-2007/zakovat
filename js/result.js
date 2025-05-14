import { db } from './firebase.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// URLdan testId olish
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get('testId');

if (!testId) {
  console.error('Test ID mavjud emas!');
  alert('Test ID mavjud emas. URLni tekshirib ko\'ring!');
} else {
  loadResults(testId);
}

// Testga oid barcha natijalarni yuklash
async function loadResults(testId) {
  const resultsRef = collection(db, "test_results");
  const q = query(resultsRef, where("testId", "==", testId));

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("Natijalar topilmadi.");
      alert("Natijalar topilmadi!");
      return;
    }

    let umumiyCorrect = 0;
    let umumiyTotal = 0;
    let groupName = "";

    querySnapshot.forEach((doc, index) => {
      const resultData = doc.data();
      if (index === 0) {
        groupName = resultData.group || "Nomaʼlum jamoa";
      }
      displayResults(resultData);

      const answers = resultData.answers || [];
      umumiyTotal += answers.length;
      umumiyCorrect += answers.filter(a => a.correctAnswer === a.selectedAnswer).length;
    });

    document.getElementById("correct-answers").innerText = `To‘g‘ri javoblar soni: ${umumiyCorrect} / ${umumiyTotal}`;
    document.getElementById("total-score").innerText = `To‘plangan ballar: ${umumiyCorrect}`;

  } catch (error) {
    console.error("Xatolik yuz berdi: ", error);
    alert("Natijalarni yuklashda xatolik yuz berdi.");
  }
}

// Foydalanuvchi natijalarini chiqarish
function displayResults(resultData) {
  const resultContainer = document.getElementById("result-container");

  const resultElement = document.createElement("div");
  resultElement.classList.add("bg-white", "p-4", "rounded-lg", "shadow");

  const title = document.createElement("h3");
  title.classList.add("text-lg", "font-semibold", "mb-2");
  title.textContent = `Jamoa Nomi: ${resultData.group || 'Nomaʼlum jamoa'}`;

  const totalCorrect = resultData.answers?.filter(a => a.selectedAnswer === a.correctAnswer).length || 0;
  const totalQuestions = resultData.answers?.length || 0;

  const summary = document.createElement("p");
  summary.textContent = `To‘g‘ri javoblar: ${totalCorrect} / ${totalQuestions}`;

  resultElement.appendChild(title);
  resultElement.appendChild(summary);

  resultContainer.appendChild(resultElement);
}

// Logout funksiyasi
window.logout = function () {
  import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js").then(({ getAuth, signOut }) => {
    const auth = getAuth();
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });
};

window.goBack = function () {
  window.history.back();
};
