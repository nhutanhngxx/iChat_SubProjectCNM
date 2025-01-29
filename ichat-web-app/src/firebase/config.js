// firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDw2SNiIetoPPzAHPh7YfV5bbNOg47eKAQ',
  authDomain: 'ichat-app-55343.firebaseapp.com',
  projectId: 'ichat-app-55343',
  storageBucket: 'ichat-app-55343.appspot.com',
  messagingSenderId: '555685690897',
  appId: '1:555685690897:web:1c24752e218be1acd67bb0',
  measurementId: 'G-44N6LRRXF4',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };
