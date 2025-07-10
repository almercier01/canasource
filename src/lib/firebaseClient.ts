import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "canasource-f396b.firebaseapp.com",
  projectId: "canasource-f396b",
  storageBucket: "canasource-f396b.appspot.com",
  messagingSenderId: "912316492023",
  appId: "1:912316492023:web:f7e80209719636137d0bf2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
