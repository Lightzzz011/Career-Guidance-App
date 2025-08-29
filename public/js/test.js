// public/js/test.js
/**
 * Aptitude test engine:
 * - Renders MCQs to a form container
 * - Grades test, stores results in Firestore, logs action
 * - Saves a lightweight result to sessionStorage and redirects to test-completion.html
 *
 * Auto-init: if page has a form with id "test-form" this file will render a default test.
 *
 * Usage:
 *  import { renderTest, gradeTest } from "./test.js";
 *  renderTest(customQuestionsArray, 'test-form');
 */

import { db, auth } from "./firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logAction } from "./logger.js";

// Default small sample test (replace with real questions or fetch from DB)
export const DEFAULT_QUESTIONS = [
  { id: "q1", q: "2 + 2 = ?", options: ["3", "4", "5"], answer: 1 },
  { id: "q2", q: "Capital of India?", options: ["Delhi", "Mumbai", "Kolkata"], answer: 0 },
  { id: "q3", q: "Synonym of 'Happy'?", options: ["Sad", "Joyful", "Angry"], answer: 1 }
];

/**
 * Render an array of questions into a form container.
 * @param {Array} questions
 * @param {string} formId
 */
export function renderTest(questions = DEFAULT_QUESTIONS, formId = "test-form") {
  const form = document.getElementById(formId);
  if (!form) return;
  form.innerHTML = ""; // clear

  questions.forEach((ques, i) => {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `<p><strong>${i + 1}.</strong> ${ques.q}</p>`;
    ques.options.forEach((opt, j) => {
      const inputId = `${ques.id || "q" + i}-opt-${j}`;
      div.innerHTML += `<label for="${inputId}"><input id="${inputId}" type="radio" name="${ques.id || "q" + i}" value="${j}"> ${opt}</label><br/>`;
    });
    form.appendChild(div);
  });

  // If there's no submit button on page, create one inside form
  if (!form.querySelector("button[type=submit]")) {
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Submit Test";
    form.appendChild(btn);
  }
}

/**
 * Grade the test (reads choices from form), returns {score, total, details}
 * @param {Array} questions
 * @param {string} formId
 */
export function gradeTest(questions = DEFAULT_QUESTIONS, formId = "test-form") {
  const form = document.getElementById(formId);
  if (!form) return { score: 0, total: questions.length, details: [] };

  let score = 0;
  const details = questions.map((ques) => {
    const el = form.querySelector(`input[name="${ques.id || ""}"]:checked`);
    const chosen = el ? parseInt(el.value, 10) : null;
    const correct = ques.answer;
    if (chosen === correct) score++;
    return { questionId: ques.id, chosen, correct };
  });

  return { score, total: questions.length, details };
}

/**
 * Save the result to Firestore and log action.
 * Also stores a small copy in sessionStorage and redirects to test-completion.html
 * @param {object} result {score, total, details}
 */
export async function saveResultAndRedirect(result = {}) {
  try {
    const uid = auth.currentUser?.uid || null;
    // store in DB if logged in
    if (uid) {
      await addDoc(collection(db, "tests"), {
        studentId: uid,
        score: result.score,
        total: result.total,
        details: result.details || [],
        createdAt: serverTimestamp()
      });
      await logAction(uid, "Completed Aptitude Test", { score: result.score, total: result.total });
    }

    // store locally to show on completion page
    sessionStorage.setItem("lastTestResult", JSON.stringify({
      score: result.score,
      total: result.total,
      timestamp: new Date().toISOString()
    }));

    // redirect to completion page
    window.location.href = "test-completion.html";
    return { ok: true };
  } catch (err) {
    console.error("saveResultAndRedirect:", err);
    return { ok: false, error: err.message };
  }
}

/* ------------------ Auto-init when included as module ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("test-form");
  if (!form) return;

  // If questions are defined globally on the page as 'PAGE_QUESTIONS', prefer them.
  const questions = window.PAGE_QUESTIONS || DEFAULT_QUESTIONS;
  renderTest(questions, form.id);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const result = gradeTest(questions, form.id);
    // Show immediate feedback if there is an element with id 'result'
    const resultBox = document.getElementById("result");
    if (resultBox) resultBox.textContent = `You scored ${result.score} / ${result.total}`;
    await saveResultAndRedirect(result);
  });
});
