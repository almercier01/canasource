// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRO8FxbDMslInvxE0FfRBRzdI56U4Zv2I",
  authDomain: "canasource-f396b.firebaseapp.com",
  projectId: "canasource-f396b",
  storageBucket: "canasource-f396b.firebasestorage.app",
  messagingSenderId: "912316492023",
  appId: "1:912316492023:web:f7e80209719636137d0bf2",
  measurementId: "G-B25M804RFY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);