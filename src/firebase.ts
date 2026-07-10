import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpEW78zm8sRLh6b4CPtu9yP4wgo4h6H64",
  authDomain: "model-mile-38gvj.firebaseapp.com",
  projectId: "model-mile-38gvj",
  storageBucket: "model-mile-38gvj.firebasestorage.app",
  messagingSenderId: "1034924504495",
  appId: "1:1034924504495:web:862b26ee4da2711459ab5a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-bigincontri-b7c2535f-3480-426f-8fd1-cbbcdb2dcfe7");
