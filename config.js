import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAId4jEj9C-CZrwZfp2lAh8GCl_Xt0lWCY",
  authDomain: "myportal-c323f.firebaseapp.com",
  databaseURL: "https://myportal-c323f-default-rtdb.firebaseio.com",
  projectId: "myportal-c323f",
  storageBucket: "myportal-c323f.firebasestorage.app",
  messagingSenderId: "24565038126",
  appId: "1:24565038126:web:f952365de4a7624f1133bf"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
