// src/lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCYGLuKxfwCsvLuUVf7rHTkmPl5SHdJj90",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "chatty-e8c27.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "chatty-e8c27",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "chatty-e8c27.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "456319301101",
  appId: process.env.FIREBASE_APP_ID || "1:456319301101:web:e9bdcc674671fdedfbe3e4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app };
