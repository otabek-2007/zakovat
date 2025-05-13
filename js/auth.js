// auth.js
import { auth } from './firebase.js';  // Firebase initialization faylini import qilish
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Login formasi yuborilganda
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('error');

  // Faqat admin email
  if (email !== "admin@admin.com") {
    error.textContent = "Only admin can login";
    error.classList.remove("hidden");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("isAdmin", "true");
    window.location.href = "/dashboard.html";
  } catch (err) {
    error.textContent = "Login failed: " + err.message;
    error.classList.remove("hidden");
  }
});
