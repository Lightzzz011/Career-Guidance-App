// public/js/db.js
import { db } from "./firebaseConfig.js";
import { collection, addDoc, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logAction } from "./logger.js";

/*
 * addCollege - admin-only function to add college doc
 * @param {object} payload - {name, location, fees, eligibility, rank, scholarships}
 */
export async function addCollege(payload, adminUserId) {
  try {
    const docRef = await addDoc(collection(db, "colleges"), {
      ...payload,
      createdAt: new Date().toISOString()
    });
    await logAction(adminUserId || "admin", "Added College", { collegeId: docRef.id, name: payload.name });
    return { ok: true, id: docRef.id };
  } catch (err) {
    console.error("addCollege:", err);
    return { ok: false, error: err.message };
  }
}

/*
 * getColleges - basic fetch all or by location
 * @param {string|null} location - "India" | "Abroad" | null
 */
export async function getColleges(location = null) {
  try {
    let q;
    if (location) {
      q = query(collection(db, "colleges"), where("location", "==", location));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      const snap = await getDocs(collection(db, "colleges"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.error("getColleges:", err);
    return [];
  }
}

/*
 * getStudentById
 */
export async function getStudentById(uid) {
  try {
    const d = await getDoc(doc(db, "students", uid));
    if (d.exists()) return { id: d.id, ...d.data() };
    return null;
  } catch (err) {
    console.error("getStudentById:", err);
    return null;
  }
}
