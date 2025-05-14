// Firebase importlari
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyBXJSvrT31Bss6bs-WJe_Hm1kyccip2P_4",
  authDomain: "sorovnoma-93601.firebaseapp.com",
  projectId: "sorovnoma-93601",
  storageBucket: "sorovnoma-93601.appspot.com",
  messagingSenderId: "607837032856",
  appId: "1:607837032856:web:a6a3ba5f5d26f1d6d25bed"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// testId
const testId = new URLSearchParams(window.location.search).get('testId');

// Auth check
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'index.html';
});

let questionIndex = 1;

function generateAnswerGroup(number) {
  return `
    <div class="answer-input-group">
      <label for="answer-${number}" class="block text-gray-700">Variant ${number}</label>
      <input type="text" class="answer w-full p-2 border rounded" required />
    </div>
  `;
}

// Savol formasi yaratish
export function createQuestionForm() {
  const wrapper = document.createElement('div');
  wrapper.className = "space-y-4 bg-white p-6 rounded-lg shadow";
  wrapper.dataset.index = questionIndex;

  wrapper.innerHTML = `
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">Savol ${questionIndex}</h2>
      <button type="button" class="close-btn text-red-500" onclick="closeQuestion(${questionIndex})">X</button>
    </div>
    <div>
      <label class="block text-gray-700">Savol matni</label>
      <input type="text" class="question-text w-full p-2 border rounded" required>
    </div>

    <div class="answers-container space-y-2">
      ${generateAnswerGroup(1)}
    </div>

    <button type="button" class="add-answer bg-blue-500 text-white px-4 py-2 rounded">Variant qo‘shish</button>

    <div>
      <label class="block text-gray-700">To‘g‘ri javob raqami</label>
      <select class="correct-answer w-full p-2 border rounded" required>
        <option value="1">Javob 1</option>
      </select>
    </div>

    <div>
      <label class="block text-gray-700">Ball</label>
      <input type="number" class="points w-full p-2 border rounded" required>
    </div>

    <div>
      <label class="block text-gray-700">Savol davomiyligi (daqiqada)</label>
      <input type="number" class="duration w-full p-2 border rounded" required>
    </div>
  `;

  document.getElementById('questions-wrapper').appendChild(wrapper);
  questionIndex++;
}

// Formalar indekslarini yangilash
function updateQuestionIndexes() {
  const questionForms = document.querySelectorAll('[data-index]');
  questionForms.forEach((form, idx) => {
    const questionNumber = idx + 1;
    form.dataset.index = questionNumber;
    form.querySelector('h2').textContent = `Savol ${questionNumber}`;
    form.querySelector('.close-btn').setAttribute('onclick', `closeQuestion(${questionNumber})`);
  });

  questionIndex = questionForms.length + 1;
}

// Close Question logic
export function closeQuestion(number) {
  const form = document.querySelector(`div[data-index='${number}']`);
  if (form) {
    form.remove();
    updateQuestionIndexes();
  }
}

// Dinamik tugmalar
document.addEventListener("click", (e) => {
  // Variant qo‘shish tugmasi
  if (e.target.classList.contains("add-answer")) {
    const form = e.target.closest("div[data-index]");
    const answersContainer = form.querySelector(".answers-container");
    const answerCount = answersContainer.querySelectorAll(".answer-input-group").length + 1;

    answersContainer.insertAdjacentHTML("beforeend", generateAnswerGroup(answerCount));

    const select = form.querySelector(".correct-answer");
    const option = document.createElement("option");
    option.value = answerCount;
    option.textContent = `Javob ${answerCount}`;
    select.appendChild(option);
  }

  // Savolni yopish
  if (e.target.classList.contains("close-btn")) {
    const questionNumber = e.target.closest("div[data-index]").dataset.index;
    closeQuestion(questionNumber);
  }
});

// Savol qo‘shish tugmasi
document.getElementById("add-question").addEventListener("click", () => {
  createQuestionForm();
});

// Testni yakunlash tugmasi
document.getElementById("finish-test").addEventListener("click", async () => {
  const allForms = document.querySelectorAll("#questions-wrapper > div[data-index]");
  const allQuestions = [];

  for (const form of allForms) {
    const questionText = form.querySelector(".question-text").value.trim();
    const correctAnswer = form.querySelector(".correct-answer").value;
    const points = parseInt(form.querySelector(".points").value);
    const duration = parseInt(form.querySelector(".duration").value);

    const answersInputs = form.querySelectorAll(".answer");
    const answers = {};
    let valid = true;

    answersInputs.forEach((input, index) => {
      const val = input.value.trim();
      if (!val) valid = false;
      answers[index + 1] = val;
    });

    if (!valid || !questionText || !correctAnswer || isNaN(points) || isNaN(duration)) {
      alert(`Savol ${form.dataset.index} da xatolik: barcha maydonlar to‘ldirilishi shart.`);
      return;
    }

    allQuestions.push({
      questionText,
      answers,
      correctAnswer: Number(correctAnswer),
      points,
      duration
    });
  }

  try {
    for (const q of allQuestions) {
      await addDoc(collection(db, "tests", testId, "questions"), q);
    }

    alert("Barcha savollar muvaffaqiyatli qo‘shildi!");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Yozish xatosi:", error);
    alert("Xatolik yuz berdi.");
  }
});

// Logout funksiyasi
window.logout = function () {
  signOut(auth).then(() => window.location.href = 'index.html')
    .catch((error) => console.error("Logout xatosi:", error));
};

// Dastlab bitta savol formasi
document.getElementById("add-question").click();
