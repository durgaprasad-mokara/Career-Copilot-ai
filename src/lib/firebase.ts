import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCpZFH92UeQegGxkhWV92n2Qb29rkz9moQ",
  authDomain: "gen-lang-client-0147798124.firebaseapp.com",
  projectId: "gen-lang-client-0147798124",
  storageBucket: "gen-lang-client-0147798124.firebasestorage.app",
  messagingSenderId: "528569441246",
  appId: "1:528569441246:web:4844ba6e0f0396cc549b4f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Use custom firestore database ID from applet config
export const db = getFirestore(app, "ai-studio-3fbf8779-164e-48cc-adbf-cacc3ac5762c");
