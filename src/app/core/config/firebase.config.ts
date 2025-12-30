// Baseado em: https://firebase.google.com/docs/web/setup#angular
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration para sorveteria-perseveranca
export const firebaseConfig = {
  apiKey: "AIzaSyCeUuu65ySAm9dLj_XtRMCp4SwX2-S7WpY",
  authDomain: "sorveteria-perseveranca.firebaseapp.com",
  databaseURL: "https://sorveteria-perseveranca-default-rtdb.firebaseio.com",
  projectId: "sorveteria-perseveranca",
  storageBucket: "sorveteria-perseveranca.firebasestorage.app",
  messagingSenderId: "542756479230",
  appId: "1:542756479230:web:ed08f5ea1ea6cd313c05af",
  measurementId: "G-CLT7B75N1J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
