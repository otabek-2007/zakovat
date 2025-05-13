import { auth, db } from './firebase.js';
import { getDocs, getDoc, doc, collection } from 'firebase/firestore';

const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get('testId');

auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        if (testId) {
            loadTest(testId);
        }
        loadTests();
    }
});

// Testlar ro'yxatini yuklash
async function loadTests() {
    const testListContainer = document.getElementById("test-list");
    if (!testListContainer) return;

    testListContainer.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "tests"));

        if (querySnapshot.empty) {
            testListContainer.innerHTML = `<p class="text-gray-600">Hech qanday test topilmadi.</p>`;
            return;
        }

        querySnapshot.docs.forEach((docSnap) => {
            const testData = docSnap.data();
            const testItem = document.createElement("div");
            testItem.classList.add("p-4", "bg-white", "shadow-md", "rounded-lg", "mb-4");

            const testLink = `${window.location.origin}/take-test.html?testId=${docSnap.id}`;

            testItem.innerHTML = `
                <h3 class="text-xl font-bold">${testData.name}</h3>
                <p class="text-gray-700">${testData.description}</p>
                <div class="flex gap-2 mt-3">
                    <button onclick="viewTest('${docSnap.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Savollarni ko'rish</button>
                    <button onclick="addQuestions('${docSnap.id}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg">Savol qo'shish</button>
                    <button onclick="copyLink('${testLink}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Linkni nusxalash</button>
                </div>
            `;

            testListContainer.appendChild(testItem);
        });

    } catch (error) {
        console.error("Testlarni yuklashda xatolik:", error);
        testListContainer.innerHTML = `<p class="text-red-600">Xatolik yuz berdi. Qayta urinib ko'ring.</p>`;
    }
}

// Testni yuklash
async function loadTest(testId) {
    const docRef = doc(db, "tests", testId);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const testData = docSnap.data();
            displayTest(testData);
            if (testData.duration) startTimer(testData.duration);
        } else {
            console.error("Test topilmadi.");
        }
    } catch (err) {
        console.error("Testni yuklashda xatolik: ", err);
    }
}

// Testni ko'rsatish
function displayTest(testData) {
    const testContainer = document.getElementById("test-container");
    if (!testContainer) return;

    testContainer.innerHTML = '';

    testData.questions.forEach((question, index) => {
        const questionElement = document.createElement("div");
        questionElement.classList.add("bg-white", "p-4", "rounded-lg", "shadow");

        const questionTitle = document.createElement("h2");
        questionTitle.classList.add("text-lg", "font-semibold");
        questionTitle.innerText = `${index + 1}. ${question.questionText}`;
        questionElement.appendChild(questionTitle);

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

// Timer
let timerInterval;
let timeLeft;

function startTimer(duration) {
    timeLeft = duration * 60;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 10) {
            document.getElementById("timer").classList.add("text-red-500");
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById("time-up-modal")?.classList.remove("hidden");
            disableQuestions();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById("timer").innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function disableQuestions() {
    const questions = document.getElementById("test-container").getElementsByClassName("bg-white");
    for (let questionElement of questions) {
        const inputs = questionElement.getElementsByTagName("input");
        for (let input of inputs) {
            input.disabled = true;
        }
    }
}

function submitTest() {
    const answers = [];
    const questions = document.getElementById("test-container").getElementsByClassName("bg-white");

    for (let i = 0; i < questions.length; i++) {
        const selectedAnswer = questions[i].querySelector("input[type='radio']:checked");
        answers.push(selectedAnswer ? selectedAnswer.value : null);
    }

    calculateResult(answers);
}

async function calculateResult(answers) {
    try {
        const testDoc = await getDoc(doc(db, "tests", testId));
        if (testDoc.exists()) {
            const testData = testDoc.data();
            let score = 0;
            testData.questions.forEach((question, index) => {
                if (answers[index] && answers[index] === question.correctAnswer) {
                    score += parseInt(question.points);
                }
            });
            alert(`Sizning natijangiz: ${score} ball`);
        }
    } catch (error) {
        console.error("Natija hisoblashda xatolik: ", error);
        alert("Natija hisoblashda xatolik yuz berdi.");
    }
}

// Logout
function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error("Logout error: ", error);
        });
}

// Export kerak bo'lsa: external btnlarga ulash uchun
window.submitTest = submitTest;
window.logout = logout;
window.copyLink = (link) => {
    navigator.clipboard.writeText(link).then(() => {
        alert("Link nusxalandi!");
    });
};
window.viewTest = (id) => {
    alert(`Test ID: ${id} — Bu yerda modal yoki sahifa ochiladi.`);
};
window.addQuestions = (id) => {
    alert(`Savol qo‘shish uchun: ${id} — Bu yerda forma ochiladi.`);
};
