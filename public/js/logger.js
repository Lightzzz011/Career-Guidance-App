// public/js/logger.js
import { db } from "./firebaseConfig.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

/**
 * logAction - save action to Firestore 'logs' collection
 * @param {string} userId - uid or email
 * @param {string} action - short action description
 * @param {object} [meta] - optional metadata
 */
export async function logAction(userId, action, meta = {}) {
  try {
    const docRef = await addDoc(collection(db, "logs"), {
      user: userId || "anonymous",
      action,
      meta,
      createdAt: serverTimestamp()
    });
    // optional: return docRef.id
    return docRef.id;
  } catch (err) {
    console.error("logAction error:", err);
    return null;
  }
}
