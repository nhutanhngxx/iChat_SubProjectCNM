import firebase from 'firebase/app';

import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDw2SNiIetoPPzAHPh7YfV5bbNOg47eKAQ",
    authDomain: "ichat-app-55343.firebaseapp.com",
    projectId: "ichat-app-55343",
    storageBucket: "ichat-app-55343.firebasestorage.app",
    messagingSenderId: "555685690897",
    appId: "1:555685690897:web:1c24752e218be1acd67bb0",
    measurementId: "G-44N6LRRXF4"
  };

  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const analytics = firebase.getAnalytics(app);

  const auth = firebase.auth();
  const db = firebase.firestore();  

  export {auth, db};
  export default firebase;