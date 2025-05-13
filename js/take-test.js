// /js/take-test.js
import {
    auth, db, onAuthStateChanged, signOut,
    collection, getDocs, query, orderBy, doc, setDoc, serverTimestamp
  } from './firebase.js';
  
  let user = null;
  const testContainer = document.getElementById('test-container');
  const timerElement = document.getElementById('timer');
  const modal = document.getElementById('time-up-modal');
  
  let currentQuestionIndex = 0;
  let questions = [];
  let userAnswers = [];
  let timer = null;
  
  onAuthStateChanged(auth, (u) => {
    if (u) {
      user = u;
      loadQuestions();
    } else {
      window.location.href = '/login.html';
    }
  });
  
  window.logout = function () {
    signOut(auth).then(() => window.location.href = '/login.html');
  };
  

  async function loadQuestions() {
    const testId = new URLSearchParams(window.location.search).get('testId');
    const questionsRef = collection(db, 'tests', testId, 'questions');
    const questionsQuery = query(questionsRef, orderBy('questionText'));
    const querySnapshot = await getDocs(questionsQuery);
  
    questions = [];
    querySnapshot.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() });
    });
  
    // Tiklash
    const savedAnswers = JSON.parse(localStorage.getItem('userAnswers') || '[]');
    userAnswers = savedAnswers;
    currentQuestionIndex = userAnswers.length;
  
    if (currentQuestionIndex < questions.length) {
      showQuestion(currentQuestionIndex);
    } else {
      showModal(); // all done
    }
  }
  
  
  function showQuestion(index) {
    const q = questions[index];
  
    if (!q || !q.answers || Object.keys(q.answers).length === 0) {
      testContainer.innerHTML = `<p class="text-red-500">Savolda javoblar topilmadi.</p>`;
      return;
    }
  
    const answers = Object.entries(q.answers);
  
    testContainer.innerHTML = `
      <div class="question" id="question-${index}">
        <p class="font-bold mb-4 text-lg">${q.questionText}</p>
        ${answers.map(([key, value]) => `
          <label class="block mb-2">
            <input type="radio" name="option" value="${key}" class="mr-2">${value}
          </label>
        `).join('')}
      </div>
    `;
  
    startTimer(q.duration || 30);
  }
  
  
  function startTimer(seconds) {
    clearInterval(timer);
  
    const questionKey = `timer_question_${currentQuestionIndex}`;
    let timeRemaining = parseInt(localStorage.getItem(questionKey)) || seconds;
  
    updateTimerDisplay(timeRemaining);
  
    timer = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay(timeRemaining);
      localStorage.setItem(questionKey, timeRemaining); // vaqtni saqlash
  
      if (timeRemaining <= 0) {
        clearInterval(timer);
        localStorage.removeItem(questionKey); // tozalash
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
  
    localStorage.removeItem(`timer_question_${currentQuestionIndex}`);
  
    userAnswers.push({
      questionId: q.id,
      selectedAnswer: selected ? selected.value : null,
      correctAnswer: q.correctAnswer,
      points: q.points
    });
  
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers)); // saqlash
  
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion(currentQuestionIndex);
    } else {
      localStorage.removeItem('userAnswers');
      showModal();
    }
  }
  
  function showModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('show');
    } else {
      console.error('Modal elementi topilmadi!');
    }
  }
  
// Test tugatishdan so'ng modalni ko'rsatish
window.submitTest = async function () {
    clearInterval(timer);

    if (!user) return alert('User not found');

    const resultDoc = doc(db, 'test_results', user.uid);
    await setDoc(resultDoc, {
        answers: userAnswers,
        timestamp: serverTimestamp()
    });

    window.location.href = '/result.html'; // Natijalarni ko'rsatish
    showModal(); // Modalni ko'rsatish
};
