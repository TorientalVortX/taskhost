// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeP7_TrORZd75pEnQCss0lCL3Igp1tnXA",
  authDomain: "taskhost-49be4.firebaseapp.com",
  projectId: "taskhost-49be4",
  storageBucket: "taskhost-49be4.firebasestorage.app",
  messagingSenderId: "459616543129",
  appId: "1:459616543129:web:69c231cf3157eabd5ef308",
  measurementId: "G-DF26CPS8VL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
