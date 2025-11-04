import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7Ml1NQYgTfiHVHhO6GbVQQ-KYt1J3EQ4",
  authDomain: "emotionstorage-2d602.firebaseapp.com",
  projectId: "emotionstorage-2d602",
  storageBucket: "emotionstorage-2d602.appspot.com",
  messagingSenderId: "942038424737",
  appId: "1:942038424737:web:d9e2e6a92816987b8be4e0",
};

// ✅ Prevent duplicate app creation (hot reload safe)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Firestore
export const db = getFirestore(app);
