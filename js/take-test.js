// take-test.js
import { db, auth } from './firebase.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const testContainer = document.getElementById('test-container');
const timerElement = document.getElementById('timer');
const modal = document.getElementById('time-up-modal');

let timer;
let timeLeft = 300; // 5 daqiqa

function startTimer() {
  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      modal.classList.remove('hidden');
    } else {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      timeLeft--;
    }
  }, 1000);
}

function renderQuestions(questions) {
  questions.forEach((doc, index) => {
    const data = doc.data();

    const questionEl = document.createElement('div');
    questionEl.className = 'bg-white p-4 rounded shadow';

    const questionText = document.createElement('h3');
    questionText.className = 'font-semibold mb-2';
    questionText.textContent = `${index + 1}. ${data.question}`;
    questionEl.appendChild(questionText);

    const answersContainer = document.createElement('div');
    data.answers.forEach((answer, i) => {
      const label = document.createElement('label');
      label.className = 'block';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `question-${index}`;
      input.value = answer;
      input.className = 'mr-2';

      label.appendChild(input);
      label.appendChild(document.createTextNode(answer));
      answersContainer.appendChild(label);
    });

    questionEl.appendChild(answersContainer);
    testContainer.appendChild(questionEl);
  });
}

async function loadQuestions() {
  const q = query(collection(db, 'questions'), orderBy('order'));
  const querySnapshot = await getDocs(q);
  renderQuestions(querySnapshot.docs);
  startTimer();
}

function submitTest() {
  clearInterval(timer);
  const questions = testContainer.children;
  let score = 0;

  for (let i = 0; i < questions.length; i++) {
    const selected = questions[i].querySelector('input[type="radio"]:checked');
    const correct = selected && selected.value === questions[i].querySelector('h3').dataset.correct;

    if (correct) {
      score++;
    }
  }

  alert(`Sizning natijangiz: ${score} / ${questions.length}`);
}

window.submitTest = submitTest;

function logout() {
  signOut(auth).then(() => {
    window.location.href = '/login.html';
  }).catch(error => {
    console.error("Logout xatolik:", error);
  });
}

window.logout = logout;

// User tekshiruv
onAuthStateChanged(auth, user => {
  if (user) {
    loadQuestions();
  } else {
    window.location.href = '/login.html';
  }
});
