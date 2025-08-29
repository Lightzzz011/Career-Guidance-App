// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0A2694Cn0drJ03Ho8Uj7ROCanJpigQOY",
  authDomain: "career-guidance-app-abaf3.firebaseapp.com",
  projectId: "career-guidance-app-abaf3",
  storageBucket: "career-guidance-app-abaf3.appspot.com",
  messagingSenderId: "962510754575",
  appId: "1:962510754575:web:0d5c0afcea26370bf9a47a",
  measurementId: "G-N27NK30Z46"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
