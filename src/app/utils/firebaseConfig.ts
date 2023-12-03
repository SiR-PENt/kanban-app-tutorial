// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPPwaDau7U3byGhfphk4_bn8IuFllYtBc",
  authDomain: "kanban-app-tutorial.firebaseapp.com",
  projectId: "kanban-app-tutorial",
  storageBucket: "kanban-app-tutorial.appspot.com",
  messagingSenderId: "254663431307",
  appId: "1:254663431307:web:c434c88cc09d0012d2b08e",
  measurementId: "G-MQCQDHKKM2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
