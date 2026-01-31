import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAKkvOztBDOJ7hJ6vVZsTrBwi-yMPWPkBs",
    authDomain: "xxxx-98488.firebaseapp.com",
    databaseURL: "https://xxxx-98488-default-rtdb.firebaseio.com",
    projectId: "xxxx-98488",
    storageBucket: "xxxx-98488.firebasestorage.app",
    messagingSenderId: "1043427778445",
    appId: "1:1043427778445:web:fcd7e3d05ecc2e947a67c4"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
