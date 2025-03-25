// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAn8nE09zLwpymWCAUAofE7R31ZOIN0GjA",
  authDomain: "a4youandme-store.firebaseapp.com",
  databaseURL: "https://a4youandme-store-default-rtdb.firebaseio.com",
  projectId: "a4youandme-store",
  storageBucket: "a4youandme-store.firebasestorage.app",
  messagingSenderId: "719925501283",
  appId: "1:719925501283:web:94e1f99a17a18f2709c756",
  measurementId: "G-9CDP8SVX0J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const dbRef = ref(getDatabase());
const storage = getStorage(app);

export { app, auth, analytics, db, dbRef, storage };
