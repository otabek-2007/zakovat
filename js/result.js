// Firebase import qilish
import { auth, db } from './firebase.js';

// Natijalarni olish
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get('testId');
const userId = auth.currentUser ? auth.currentUser.uid : null;

if (!userId) {
    window.location.href = 'index.html'; // Agar foydalanuvchi tizimga kirgan bo'lmasa, index sahifaga yo'naltiramiz
} else {
    loadResults(testId, userId);
}

// Natijalarni yuklash
function loadResults(testId, userId) {
    db.collection("testResults")
        .where("testId", "==", testId)
        .where("userId", "==", userId)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                alert("Natijalar topilmadi!");
                return;
            }

            querySnapshot.forEach((doc) => {
                const resultData = doc.data();
                displayResults(resultData);
            });
        })
        .catch((error) => {
            console.error("Natijalarni yuklashda xatolik: ", error);
            alert("Natijalarni yuklashda xatolik yuz berdi.");
        });
}

// Natijalarni ekranga chiqarish
function displayResults(resultData) {
    const resultContainer = document.getElementById("result-container");

    const resultElement = document.createElement("div");
    resultElement.classList.add("bg-white", "p-4", "rounded-lg", "shadow");

    const resultTitle = document.createElement("h2");
    resultTitle.classList.add("text-xl", "font-semibold");
    resultTitle.innerText = `Test: ${resultData.testName}`;
    resultElement.appendChild(resultTitle);

    const resultText = document.createElement("p");
    resultText.classList.add("mt-2");
    resultText.innerText = `Sizning natijangiz: ${resultData.score} ball (To'liq ball: ${resultData.totalPoints})`;
    resultElement.appendChild(resultText);

    resultContainer.appendChild(resultElement);
}

// Orqaga qaytish
function goBack() {
    window.history.back();
}

// Logout funksiyasi
function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html'; // Admin chiqishi
        })
        .catch((error) => {
            console.error("Logout error: ", error);
        });
}
