import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyAn8nE09zLwpymWCAUAofE7R31ZOIN0GjA",
  authDomain: "a4youandme-store.firebaseapp.com",
  databaseURL: "https://a4youandme-store-default-rtdb.firebaseio.com",
  projectId: "a4youandme-store",
  storageBucket: "a4youandme-store.firebasestorage.app", // This is your Firebase Storage bucket
  messagingSenderId: "719925501283",
  appId: "1:719925501283:web:94e1f99a17a18f2709c756",
  measurementId: "G-9CDP8SVX0J"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, and Storage
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { auth, firestore, signInWithEmailAndPassword, storage }; // Export storage
