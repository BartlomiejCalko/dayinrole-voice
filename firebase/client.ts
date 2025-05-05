// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCt-U2e5tnbnMm2nUdARiR4NCYY_xZyhMI",
  authDomain: "dayinrole.firebaseapp.com",
  projectId: "dayinrole",
  storageBucket: "dayinrole.firebasestorage.app",
  messagingSenderId: "570880340622",
  appId: "1:570880340622:web:6ab055b7ebca7c0c62cfdf",
  measurementId: "G-M4CRCMLZEG"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);