// public/js/auth.js
import { auth } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { addDoc, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from "./firebaseConfig.js";
import { logAction } from "./logger.js";

/**
 * registerStudent - creates a Firebase Auth user and a Firestore entry
 * @param {object} payload {name, email, password, cgpa, role}
 */
export async function registerStudent(payload) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
    const user = userCred.user;

    // store profile in Firestore
    await setDoc(doc(db, "students", user.uid), {
      name: payload.name,
      email: payload.email,
      cgpa: payload.cgpa || null,
      role: payload.role || "student",
      createdAt: new Date().toISOString()
    });

    await updateProfile(user, { displayName: payload.name }).catch(()=>{});
    await logAction(user.uid, "User Registered", { email: payload.email, role: payload.role });

    return { ok: true, uid: user.uid };
  } catch (err) {
    console.error("registerStudent:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * loginUser - signs in with email/password
 * @param {string} email
 * @param {string} password
 */
export async function loginUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await logAction(cred.user.uid, "User Logged In", { email });
    return { ok: true, uid: cred.user.uid };
  } catch (err) {
    console.error("loginUser:", err);
    return { ok: false, error: err.message };
  }
}

export async function logoutUser() {
  try {
    const uid = auth.currentUser?.uid || null;
    await signOut(auth);
    await logAction(uid, "User Logged Out");
    return { ok: true };
  } catch (err) {
    console.error("logoutUser:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * onAuthChange - provide callback when auth state changes
 * @param {function} cb - receives user or null
 */
export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}
