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
      let umumiyPoints = 0;
  
      querySnapshot.forEach((doc, index) => {
        const resultData = doc.data();
  
        const answers = resultData.answers || [];
  
        console.log(`Natija ${index + 1}:`, resultData); // Natijalarni konsolga chiqarish
  
        // Har bir foydalanuvchining natijalarini ko‘rsatish
        displayResults(resultData);
  
        // To‘g‘ri javoblarni hisoblash
        answers.forEach((ans) => {
          umumiyTotal++;
        
          // selectedAnswer ni son formatiga o‘zgartirish
          const selectedAnswer = String(ans.selectedAnswer); // String formatiga o‘zgartirish
          const correctAnswer = String(ans.correctAnswer); // String formatiga o‘zgartirish
        
          // Tanlangan javob va to‘g‘ri javoblarni tekshirish
          console.log(`Savol: ${ans.questionId} - Tanlangan javob: ${selectedAnswer}, To'g'ri javob: ${correctAnswer}`);
        
          // Stringga aylantirilgan selectedAnswer va correctAnswer ni taqqoslash
          const correct = selectedAnswer === correctAnswer;
          console.log(`To‘g‘ri javobmi? ${correct ? 'Ha' : 'Yo‘q'}`);
        
          if (correct) {
            umumiyCorrect++;
            umumiyPoints += ans.points || 1; // agar points yo‘q bo‘lsa, 1 deb olinadi
          }
        });
        
      });
  
      document.getElementById("correct-answers").innerText = `To‘g‘ri javoblar soni: ${umumiyCorrect}`;
      document.getElementById("total-score").innerText = `To‘plangan ballar: ${umumiyPoints}`;
  
    } catch (error) {
      console.error("Xatolik yuz berdi: ", error);
      alert("Natijalarni yuklashda xatolik yuz berdi.");
    }
  }
  
  // Foydalanuvchi natijalarini chiqarish
  function displayResults(resultData) {
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
      const selectedAnswer = String(ans.selectedAnswer); // String formatiga o‘zgartirish
      const correctAnswer = String(ans.correctAnswer); // String formatiga o‘zgartirish
  
      console.log(`Savol: ${ans.questionId} - Tanlangan javob: ${selectedAnswer}`);
  
      if (selectedAnswer === correctAnswer) {
        correctCount++;
        pointsEarned += ans.points || 1;
      }
    });
  
    const summary = document.createElement("p");
    summary.textContent = `To‘g‘ri javoblar: ${correctCount} | Ballar: ${pointsEarned}`;
  
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
