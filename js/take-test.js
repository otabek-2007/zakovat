// dashboard.js

import { auth, db } from './firebase.js'; // firebase.js-ni import qilish

// Test ID olish
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get('testId');

// Login tekshiruvi
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';  // Agar admin login qilmagan bo'lsa, index sahifaga yo'naltiramiz
    } else {
        loadTest(testId); // Testni yuklash
    }
});

// Testni yuklash
function loadTest(testId) {
    db.collection("tests").doc(testId).get()
        .then((testDoc) => {
            if (!testDoc.exists) {
                alert("Test topilmadi!");
                return;
            }
            const testData = testDoc.data();
            document.title = `Test: ${testData.name}`;

            // Test va savollarni dinamik tarzda yaratish
            displayTest(testData);

            // Timerni ishga tushirish
            startTimer(testData.duration);
        })
        .catch((error) => {
            console.error("Testni yuklashda xatolik: ", error);
            alert("Testni yuklashda xatolik yuz berdi.");
        });
}

// Testni ekranga chiqarish
function displayTest(testData) {
    const testContainer = document.getElementById("test-container");

    testData.questions.forEach((question, index) => {
        const questionElement = document.createElement("div");
        questionElement.classList.add("bg-white", "p-4", "rounded-lg", "shadow");

        const questionTitle = document.createElement("h2");
        questionTitle.classList.add("text-lg", "font-semibold");
        questionTitle.innerText = `${index + 1}. ${question.questionText}`;
        questionElement.appendChild(questionTitle);

        // Javob variantlarini ko'rsatish
        const answersContainer = document.createElement("div");
        answersContainer.classList.add("mt-2");
        ["1", "2", "3", "4"].forEach((answerIndex) => {
            const answer = question.answers[answerIndex];
            const answerLabel = document.createElement("label");
            answerLabel.classList.add("block", "mt-2");

            const answerInput = document.createElement("input");
            answerInput.type = "radio";
            answerInput.name = `question-${index}`;
            answerInput.value = answerIndex;
            answerInput.classList.add("mr-2");

            answerLabel.appendChild(answerInput);
            answerLabel.appendChild(document.createTextNode(answer));
            answersContainer.appendChild(answerLabel);
        });

        questionElement.appendChild(answersContainer);
        testContainer.appendChild(questionElement);
    });
}

// Timerni ishga tushurish
let timerInterval;
let timeLeft;

function startTimer(duration) {
    timeLeft = duration * 60;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById("time-up-modal").classList.remove("hidden");
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById("timer").innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Testni yuborish
function submitTest() {
    // Foydalanuvchining javoblarini olish
    const answers = [];
    const testContainer = document.getElementById("test-container");
    const questions = testContainer.getElementsByClassName("bg-white");

    for (let i = 0; i < questions.length; i++) {
        const questionElement = questions[i];
        const selectedAnswer = questionElement.querySelector("input[type='radio']:checked");
        if (selectedAnswer) {
            answers.push(selectedAnswer.value);
        } else {
            answers.push(null);
        }
    }

    // Natijani hisoblash va ko'rsatish
    calculateResult(answers);
}

// Natijani hisoblash
function calculateResult(answers) {
    let score = 0;
    db.collection("tests").doc(testId).get()
        .then((testDoc) => {
            const testData = testDoc.data();
            testData.questions.forEach((question, index) => {
                if (answers[index] && answers[index] === question.correctAnswer) {
                    score += parseInt(question.points);
                }
            });

            alert(`Sizning natijangiz: ${score} ball`);
        })
        .catch((error) => {
            console.error("Natija hisoblashda xatolik: ", error);
            alert("Natija hisoblashda xatolik yuz berdi.");
        });
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
