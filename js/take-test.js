import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    doc, addDoc, serverTimestamp,
    collection, query, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM elementlar
const testContainer = document.getElementById('test-container');
const timerElement = document.getElementById('timer');
const modal = document.getElementById('time-up-modal');
const groupInput = document.getElementById('group-name-input');

let user = null;
let testId = null;
let testName = null;

let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];
let score = 0;
let timer = null;

// Foydalanuvchini aniqlash
onAuthStateChanged(auth, (u) => {
    user = u;
});

// Savollarni yuklash
async function loadQuestions() {
    const params = new URLSearchParams(window.location.search);
    testId = params.get('testId');
    testName = params.get('testName');

    if (!testId) {
        alert("Test ID topilmadi. URLni tekshiring!");
        return;
    }

    const qRef = collection(db, 'tests', testId, 'questions');
    const qSnap = await getDocs(query(qRef, orderBy('questionText')));
    questions = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const saved = JSON.parse(localStorage.getItem('userAnswers_' + testId) || '[]');
    userAnswers = saved;
    currentQuestionIndex = userAnswers.length;

    if (currentQuestionIndex < questions.length) {
        showQuestion(currentQuestionIndex);
    } else {
        showModal();
    }
}

// Savolni ko'rsatish
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

// Radio tugmalar toggle qilish
function setupRadioToggle() {
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('click', function () {
            if (this.dataset.clicked === 'true') {
                this.checked = false;
                this.dataset.clicked = 'false';
            } else {
                radios.forEach(r => r.dataset.clicked = 'false');
                this.dataset.clicked = 'true';
            }
        });
    });
}

// Timerni boshlash
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

    // Ehtiyotkorlik bilan stringlar solishtirilmoqda
    const correctAnswer = q.correctAnswer ? q.correctAnswer.toString().trim().toLowerCase() : null;
    const userAnswer = selectedAnswer ? selectedAnswer.toString().trim().toLowerCase() : null;

    const isCorrect = correctAnswer && userAnswer && userAnswer === correctAnswer;

    userAnswers.push({
        questionId: q.id,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        points: q.points || 0,
        isCorrect
    });

    if (isCorrect) {
        score += Number(q.points || 0);
    }

    localStorage.setItem('userAnswers_' + testId, JSON.stringify(userAnswers));
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion(currentQuestionIndex);
    } else {
        showModal();
    }
}


// Modalni ko‘rsatish
function showModal() {
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('block');
    }
}

window.submitTest = async function () {
    clearInterval(timer);
    const groupName = groupInput.value.trim() || "Nomaʼlum guruh";

    if (!user) {
        alert("Foydalanuvchi aniqlanmadi.");
        return;
    }

    try {
        await addDoc(collection(db, "test_results"), {
            uid: user.uid,
            email: user.email,
            testId,
            testName: testName || "Nomaʼlum test",
            answers: userAnswers,
            totalScore: score,
            group: groupName,
            submittedAt: serverTimestamp()
        });

        localStorage.removeItem('userAnswers_' + testId);

        alert("Natijangiz saqlandi!");
        window.location.href = `waiting.html`;
    } catch (err) {
        console.error("Xatolik:", err);
        alert("Natijani saqlashda xatolik yuz berdi.");
    }
};


loadQuestions();
