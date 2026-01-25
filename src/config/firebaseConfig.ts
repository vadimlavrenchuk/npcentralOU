import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration for MechanicPro project
const firebaseConfig = {
  apiKey: "AIzaSyCA0J_NCIf4ze7VjU41rEWW3s9Tsu6eQN8",
  authDomain: "mechanicpro-17959.firebaseapp.com",
  projectId: "mechanicpro-17959",
  storageBucket: "mechanicpro-17959.firebasestorage.app",
  messagingSenderId: "269820078221",
  appId: "1:269820078221:web:606e77b2ce98e7e6121ac4",
  measurementId: "G-XV43QPHCSE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (optional)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
