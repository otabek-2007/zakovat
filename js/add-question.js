// Firebase modullarini import qilish
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Firebase ilovasini ishga tushurish
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// URL query'dan testId olish
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get('testId');

// Foydalanuvchi tizimga kirganini tekshirish
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    }
});

// Savol qo‘shish formasi yuborilganda
document.getElementById("add-question-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Input qiymatlarni olish
    const questionText = document.getElementById("question-text").value.trim();
    const answers = [];
    const answerInputs = document.querySelectorAll(".answer");
    answerInputs.forEach((input, index) => {
        answers.push(input.value.trim());
    });

    const correctAnswer = document.getElementById("correct-answer").value.trim();
    const points = document.getElementById("points").value.trim();
    const questionDuration = document.getElementById("question-duration").value.trim();

    // Ma'lumotlar obyektini tayyorlash
    const newQuestion = {
        questionText,
        answers: {
            1: answers[0],
            2: answers[1],
            3: answers[2],
            4: answers[3],
        },
        correctAnswer,
        points: Number(points),
        duration: Number(questionDuration),
    };

    try {
        await addDoc(collection(db, "tests", testId, "questions"), newQuestion);
        alert("Savol muvaffaqiyatli qo‘shildi!");
        window.location.href = `add-question.html?testId=${testId}`;
    } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        alert("Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.");
    }
});

// Logout funksiyasi
window.logout = function () {
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error("Logout error:", error);
        });
}
document.getElementById('add-answer-btn').addEventListener('click', function () {
  const answersContainer = document.getElementById('answers-container');
  const answerCount = answersContainer.children.length + 1;

  const newAnswerGroup = document.createElement('div');
  newAnswerGroup.classList.add('answer-input-group');

  const label = document.createElement('label');
  label.setAttribute('for', `answer${answerCount}`);
  label.classList.add('block', 'text-gray-700');
  label.textContent = `Javob ${answerCount}`;

  const input = document.createElement('input');
  input.type = 'text';
  input.classList.add('answer', 'w-full', 'p-2', 'border', 'rounded');
  input.id = `answer${answerCount}`;
  input.name = `answer${answerCount}`;
  input.required = true;

  newAnswerGroup.appendChild(label);
  newAnswerGroup.appendChild(input);
  answersContainer.appendChild(newAnswerGroup);

  const correctAnswerSelect = document.getElementById('correct-answer');
  const newOption = document.createElement('option');
  newOption.value = answerCount;
  newOption.textContent = `Javob ${answerCount}`;
  correctAnswerSelect.appendChild(newOption);
});

// ✅ Dastlab sahifa yuklanganda 1-variantni select-ga qo'shish
window.addEventListener('DOMContentLoaded', () => {
  const correctAnswerSelect = document.getElementById('correct-answer');
  const option = document.createElement('option');
  option.value = 1;
  option.textContent = 'Javob 1';
  correctAnswerSelect.appendChild(option);
});
