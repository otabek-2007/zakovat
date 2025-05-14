import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    doc, setDoc, serverTimestamp,
    collection, query, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let user = null;
let testId = null;
let testName = null;

onAuthStateChanged(auth, (u) => {
    user = u;
});

const testContainer = document.getElementById('test-container');
const timerElement = document.getElementById('timer');
const modal = document.getElementById('time-up-modal');
const groupInput = document.getElementById('group-name-input');

let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];
let timer = null;
let score = 0; // Ballar

// Savollarni yuklash
async function loadQuestions() {
    testId = new URLSearchParams(window.location.search).get('testId');
    testName = new URLSearchParams(window.location.search).get('testName');

    if (!testId) {
        alert('Test ID mavjud emas. URLni tekshiring!');
        return;
    }

    const questionsRef = collection(db, 'tests', testId, 'questions');
    const questionsQuery = query(questionsRef, orderBy('questionText'));
    const querySnapshot = await getDocs(questionsQuery);

    questions = [];
    querySnapshot.forEach(doc => {
        questions.push({ id: doc.id, ...doc.data() });
    });

    const savedAnswers = JSON.parse(localStorage.getItem('userAnswers_' + testId) || '[]');
    userAnswers = savedAnswers;
    currentQuestionIndex = userAnswers.length;

    if (currentQuestionIndex < questions.length) {
        showQuestion(currentQuestionIndex);
    } else {
        showModal();
    }
}

function showQuestion(index) {
    const q = questions[index];
    if (!q || !q.answers || Object.keys(q.answers).length === 0) {
        testContainer.innerHTML = `<p>Savolda javoblar yo‘q.</p>`;
        return;
    }

    const answers = Object.entries(q.answers);
    testContainer.innerHTML = `
        <div class="question">
            <div class="mb-2 text-gray-600">Savol ${index + 1} / ${questions.length}</div>
            <p class="font-bold mb-4 text-lg">${q.questionText}</p>
            ${answers.map(([key, value]) => `
                <label class="block mb-2">
                    <input type="radio" name="option" value="${key}" class="mr-2 radio-toggle">${value}
                </label>
            `).join('')}
        </div>
    `;

    setupRadioToggle();
    startTimer(q.duration || 30);
}
function setupRadioToggle() {
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('click', function () {
            if (this.checked) {
                if (this.dataset.clicked === 'true') {
                    this.checked = false;
                    this.dataset.clicked = 'false';
                } else {
                    radios.forEach(r => r.dataset.clicked = 'false');
                    this.dataset.clicked = 'true';
                }
            }
        });
    });
}


function startTimer(seconds) {
    clearInterval(timer);
    const questionKey = `timer_${testId}_${currentQuestionIndex}`;
    let timeRemaining = parseInt(localStorage.getItem(questionKey)) || seconds;

    updateTimerDisplay(timeRemaining);
    timer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay(timeRemaining);
        localStorage.setItem(questionKey, timeRemaining);

        if (timeRemaining <= 0) {
            clearInterval(timer);
            localStorage.removeItem(questionKey);
            saveAnswer();
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    timerElement.textContent = `Vaqt: ${seconds}s`;
}

function saveAnswer() {
    const selected = document.querySelector('input[name="option"]:checked');
    const q = questions[currentQuestionIndex];

    const selectedAnswer = selected ? selected.value : null;

    // Agar javob tanlanmagan bo'lsa, bu yerda uni saqlashdan oldin tekshiring
    if (selectedAnswer === null) {
        alert("Iltimos, savolga javob bering!");
        return;
    }

    userAnswers.push({
        questionId: q.id,
        selectedAnswer: selectedAnswer,
        correctAnswer: q.correctAnswer,
        points: q.points
    });

    // To'g'ri javobni tekshirish va ballarni hisoblash
    if (selectedAnswer === q.correctAnswer) {
        score += q.points; // To'g'ri javob bo'lsa, ballarni qo'shamiz
    }

    localStorage.setItem('userAnswers_' + testId, JSON.stringify(userAnswers));
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion(currentQuestionIndex);
    } else {
        showModal();
    }
}


function showModal() {
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('block');
    }
}

// Finalni topshirish
window.submitTest = async function () {
    clearInterval(timer);

    const uid = user ? user.uid : 'guest_' + Date.now();
    const groupName = groupInput.value.trim();
    const filteredAnswers = userAnswers.filter(a => a.selectedAnswer !== null);

    const resultRef = doc(db, 'test_results', uid);
    await setDoc(resultRef, {
        testId: testId,
        testName: testName || "Nomaʼlum test",
        group: groupName,
        answers: filteredAnswers,
        score: score, // Ballarni qo'shamiz
        timestamp: serverTimestamp()
    });

    // LocalStorage tozalash
    for (let i = 0; i < questions.length; i++) {
        localStorage.removeItem(`timer_${testId}_${i}`);
    }
    localStorage.removeItem('userAnswers_' + testId);

    alert("Natijangiz saqlandi!");
    window.location.href = `/result.html?testId=${testId}`;
};

loadQuestions();
