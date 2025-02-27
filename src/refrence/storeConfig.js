import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAn8nE09zLwpymWCAUAofE7R31ZOIN0GjA",
  authDomain: "a4youandme-store.firebaseapp.com",
  databaseURL: "https://a4youandme-store-default-rtdb.firebaseio.com",
  projectId: "a4youandme-store",
  storageBucket: "a4youandme-store.firebasestorage.app",
  messagingSenderId: "719925501283",
  appId: "1:719925501283:web:94e1f99a17a18f2709c756",
  measurementId: "G-9CDP8SVX0J"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, Storage, and Realtime Database
const auth = getAuth(app);
const firestore = getFirestore(app);  // Firestore initialization
const storage = getStorage(app);
const database = getDatabase(app);

export { auth, firestore, signInWithEmailAndPassword, storage, database, ref, uploadBytes, getDownloadURL };  // Export Firestore and other modules
