// src/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDGBf-zUQk3p8q5GsjLQy0k05vQf9j6IDY",
    authDomain: "soncadeau-a01ed.firebaseapp.com",
    databaseURL: "https://soncadeau-a01ed-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "soncadeau-a01ed",
    storageBucket: "soncadeau-a01ed.appspot.com",
    messagingSenderId: "273601505110",
    appId: "1:273601505110:web:70c91e32eda2d2950f18f7",
    measurementId: "G-343HL06VH7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider();