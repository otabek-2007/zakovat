// Import faqat kerakli funksiyalarni `firebase.js` dan oling
import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "./firebase.js";

// Foydalanuvchini tekshirish
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html';
  }
});

async function loadTests() {
  const testListContainer = document.getElementById("test-list");
  testListContainer.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, "tests"));
    if (querySnapshot.empty) {
      testListContainer.innerHTML = `<p class="text-gray-600">Hech qanday test topilmadi.</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      const testData = doc.data();
      const testItem = document.createElement("div");
      testItem.classList.add("p-4", "bg-white", "shadow-md", "rounded-lg");

      const testLink = `${window.location.origin}/take-test.html?testId=${doc.id}`;

      testItem.innerHTML = `
        <h3 class="text-xl font-bold">${testData.name}</h3>
        <p class="text-gray-700">${testData.description}</p>
        <div class="flex gap-2 mt-3 flex-wrap">
          <button onclick="viewTest('${doc.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Savollarni ko'rish</button>
          <button onclick="addQuestions('${doc.id}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg">Savol qo'shish</button>
          <button onclick="copyLink('${testLink}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Linkni nusxalash</button>
          <button onclick="showResults('${doc.id}')" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">Qatnashganlar</button>
          <button onclick="deleteTest('${doc.id}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Testni o'chirish</button>
        </div>
      `;

      testListContainer.appendChild(testItem);
    });
  } catch (error) {
    console.error("Testlarni yuklashda xatolik:", error);
    testListContainer.innerHTML = `<p class="text-red-600">Xatolik yuz berdi.</p>`;
  }
}

function copyLink(link) {
  navigator.clipboard.writeText(link)
    .then(() => alert("Test linki nusxalandi!"))
    .catch((err) => {
      console.error("Linkni nusxalashda xatolik:", err);
      alert("Linkni nusxalashda xatolik yuz berdi.");
    });
}

function addQuestions(testId) {
  window.location.href = `add-question.html?testId=${testId}`;
}

function viewTest(testId) {
  window.location.href = `show-test.html?testId=${testId}`;
}

function createTest() {
  window.location.href = 'create-test.html';
}

async function deleteTest(testId) {
  const confirmDelete = confirm("Siz ushbu testi o'chirishni xohlaysizmi?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "tests", testId));
    alert("Test o'chirildi!");
    loadTests();
  } catch (error) {
    console.error("Testni o'chirishda xatolik:", error);
    alert("Xatolik yuz berdi.");
  }
}

export async function showResults(testId) {
  const resultRef = collection(db, "test_results");
  const q = query(resultRef, where("testId", "==", testId));

  try {
    const querySnapshot = await getDocs(q);
    const resultContent = document.getElementById("resultContent");
    resultContent.innerHTML = ""; // Har safar tozalash

    if (querySnapshot.empty) {
      resultContent.innerHTML = "<p>Hali hech kim ushbu testda qatnashmagan.</p>";
    } else {
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const userEmail = data.email || "Noma'lum foydalanuvchi";
        const group = data.group || "Nomaʼlum jamoa";
        
        let totalScore = 0;
        const totalQuestions = data.answers.length;

        // Ballarni hisoblash
        data.answers.forEach(answer => {
          if (answer.selectedAnswer === answer.correctAnswer) {
            totalScore += answer.points; // Yig'ilgan ballar
          }
        });

        const div = document.createElement("div");
        div.className = "bg-gray-100 p-4 rounded shadow";

        div.innerHTML = `
          <p><strong>Guruh:</strong> ${group}</p>
        `;

        resultContent.appendChild(div);
      });
    }

    document.getElementById("resultModal").classList.remove("hidden");

  } catch (error) {
    console.error("Natijalarni olishda xatolik:", error);
    alert("Natijalarni olishda xatolik yuz berdi.");
  }
}



function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
}

// Global functionlar
window.logout = () => signOut(auth).then(() => window.location.href = 'index.html');
window.createTest = createTest;
window.viewTest = viewTest;
window.addQuestions = addQuestions;
window.copyLink = copyLink;
window.deleteTest = deleteTest;
window.showResults = showResults;
window.closeModal = closeModal;

// Sahifa yuklanganda testlarni yuklash
window.onload = loadTests;
