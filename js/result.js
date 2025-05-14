import { db, auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// URLdan testId olish
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get('testId');

// Foydalanuvchini tekshirish
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Foydalanuvchi aniqlanmadi!");
    return;
  }

  if (!testId) {
    alert("Test ID mavjud emas. URLni tekshirib ko‘ring!");
    return;
  }

  await displayTestName(testId); // Test nomini chiqarish
  await loadUserResult(testId, user.uid); // Natijani yuklash
});

// Test nomini chiqarish
async function displayTestName(testId) {
  const testDocRef = doc(db, "tests", testId);
  try {
    const testSnap = await getDoc(testDocRef);
    if (testSnap.exists()) {
      const testData = testSnap.data();
      const groupNameEl = document.getElementById("group-name");
      groupNameEl.innerText = `"${testData.name}" ga qatnashganlar`;
    } else {
      console.warn("Test hujjati topilmadi.");
    }
  } catch (error) {
    console.error("Test nomini olishda xatolik:", error);
  }
}

// Faqat o‘zining natijasini yuklash
async function loadUserResult(testId, uid) {
  const resultsRef = collection(db, "test_results");
  const q = query(resultsRef, where("testId", "==", testId), where("uid", "==", uid));

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      alert("Siz bu testni hali ishlamagansiz!");
      return;
    }

    let umumiyCorrect = 0;
    let umumiyPoints = 0;

    querySnapshot.forEach((doc) => {
      const resultData = doc.data();
      const answers = resultData.answers || [];

      displayResult(resultData); // HTMLga chiqarish

      answers.forEach((ans) => {
        const selected = String(ans.selectedAnswer ?? "");
        const correct = String(ans.correctAnswer ?? "");
        if (selected === correct) {
          umumiyCorrect++;
          umumiyPoints += Number(ans.points || 1);
        }
      });
    });

    // Natijalarni chiqarish
    const resultSummary = document.getElementById("result-summary");
    const correctEl = document.createElement("p");
    correctEl.classList.add("text-green-600", "font-bold", "text-lg");
    correctEl.id = "correct-answers";

    scoreEl.classList.add("text-indigo-600", "font-bold", "text-lg");
    scoreEl.id = "total-score";
    scoreEl.innerText = `Umumiy ball: ${umumiyPoints}`;

    resultSummary.appendChild(correctEl);
    resultSummary.appendChild(scoreEl);
  } catch (error) {
    console.error("Xatolik yuz berdi: ", error);
  }
}

// HTMLga chiqarish
function displayResult(resultData) {
  const resultContainer = document.getElementById("result-container");

  const resultElement = document.createElement("div");
  resultElement.classList.add("bg-white", "p-4", "rounded-lg", "shadow", "mb-4");

  const title = document.createElement("h3");
  title.classList.add("text-lg", "font-semibold", "mb-2");
  title.textContent = `Jamoa: ${resultData.group || 'Nomaʼlum jamoa'}`;

  const answers = resultData.answers || [];
  let correctCount = 0;
  let pointsEarned = 0;

  answers.forEach((ans) => {
    const selectedAnswer = String(ans.selectedAnswer ?? "");
    const correctAnswer = String(ans.correctAnswer ?? "");
    if (selectedAnswer === correctAnswer) {
      correctCount++;
      pointsEarned += Number(ans.points || 1);
    }
  });

  const summary = document.createElement("p");
  summary.textContent = `To‘g‘ri javoblar: ${correctCount} ta | Ballar: ${pointsEarned}`;

  resultElement.appendChild(title);
  resultElement.appendChild(summary);
  resultContainer.appendChild(resultElement);
}

// Logout
window.logout = function () {
  import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js").then(({ getAuth, signOut }) => {
    const auth = getAuth();
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });
};

// Orqaga qaytish tugmasi
window.goBack = function () {
  window.history.back();
};
