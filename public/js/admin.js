// public/js/admin.js
/**
 * Admin utilities: add/remove/update colleges, manage admin list.
 * - Place in public/js/
 * - Use via: import { deleteCollege, updateCollege, addAdmin, isAdminByEmail } from "./admin.js";
 *
 * Auto-inits:
 * - If page contains a form with id "admin-add-form" it will bind submission to addCollege (uses db.addCollege).
 * - If page contains element with data-delete-college attribute, delete handlers are attached.
 */

import { db } from "./firebaseConfig.js";
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { addCollege as addCollegeDb } from "./db.js";
import { logAction } from "./logger.js";

/**
 * Checks if an email exists in the /admins collection (naive lookup).
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function isAdminByEmail(email) {
  if (!email) return false;
  try {
    const snap = await getDocs(collection(db, "admins"));
    for (const d of snap.docs) {
      const data = d.data();
      if (data.email && data.email.toLowerCase() === email.toLowerCase()) return true;
    }
    return false;
  } catch (err) {
    console.error("isAdminByEmail:", err);
    return false;
  }
}

/**
 * Add an admin entry (restrict access to super-admin in production).
 * @param {string} email
 * @param {string} addedByUid
 */
export async function addAdmin(email, addedByUid = "system") {
  try {
    const docRef = doc(collection(db, "admins")); // generate id
    await setDoc(docRef, {
      email: String(email).toLowerCase(),
      addedBy: addedByUid,
      createdAt: new Date().toISOString()
    });
    await logAction(addedByUid, "Added Admin", { email });
    return { ok: true, id: docRef.id };
  } catch (err) {
    console.error("addAdmin:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Delete a college document by id
 * @param {string} collegeId
 * @param {string} performedByUid
 */
export async function deleteCollege(collegeId, performedByUid = "admin") {
  try {
    await deleteDoc(doc(db, "colleges", collegeId));
    await logAction(performedByUid, "Deleted College", { collegeId });
    return { ok: true };
  } catch (err) {
    console.error("deleteCollege:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Update college fields (partial update)
 * @param {string} collegeId
 * @param {object} payload - fields to update
 * @param {string} performedByUid
 */
export async function updateCollege(collegeId, payload, performedByUid = "admin") {
  try {
    await updateDoc(doc(db, "colleges", collegeId), payload);
    await logAction(performedByUid, "Updated College", { collegeId, changes: payload });
    return { ok: true };
  } catch (err) {
    console.error("updateCollege:", err);
    return { ok: false, error: err.message };
  }
}

/* ------------------ Auto-bind small UI helpers (optional) ------------------ */
/* If your page uses the college add form id "college-form" (as in earlier HTML),
   we won't override it — but we also provide a small hook for an admin page that
   uses id "admin-add-form". The college-signup.html already binds directly to db.addCollege. */

document.addEventListener("DOMContentLoaded", () => {
  // admin-add-form -> uses addCollegeDb to add a college
  const adminForm = document.getElementById("admin-add-form");
  if (adminForm) {
    adminForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = adminForm.querySelector("#name")?.value?.trim();
      const location = adminForm.querySelector("#location")?.value || "India";
      const fees = parseInt(adminForm.querySelector("#fees")?.value || "0", 10);
      const cgpa = parseFloat(adminForm.querySelector("#cgpa")?.value || "0");
      const exam = adminForm.querySelector("#exam")?.value || "";

      const payload = {
        name,
        location,
        fees,
        eligibility: { cgpa, exam }
      };

      // Use db.addCollege so we get logging there
      const res = await addCollegeDb(payload, "admin-ui");
      const msgEl = adminForm.querySelector(".message");
      if (res.ok) msgEl && (msgEl.textContent = "College added successfully.");
      else msgEl && (msgEl.textContent = "Error: " + (res.error || "unknown"));
    });
  }

  // Attach simple delete handlers to elements with data-delete-college attribute
  document.querySelectorAll("[data-delete-college]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = btn.getAttribute("data-delete-college");
      if (!id) return;
      if (!confirm("Delete college permanently?")) return;
      const res = await deleteCollege(id, "admin-ui");
      if (res.ok) {
        btn.closest("li")?.remove();
      } else {
        alert("Delete failed: " + res.error);
      }
    });
  });
});
