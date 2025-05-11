// src/lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCYGLuKxfwCsvLuUVf7rHTkmPl5SHdJj90",
authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chatty-e8c27.firebaseapp.com",
projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chatty-e8c27",
storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chatty-e8c27.firebasestorage.app",
messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "456319301101",
appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:456319301101:web:e9bdcc674671fdedfbe3e4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app };