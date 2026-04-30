/**
 * AuthContext.jsx
 * Provides authentication state and helpers to the entire app.
 * Wrap your app with <AuthProvider> and call useAuth() in any component.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import SplashScreen from '../components/SplashScreen';

const AuthContext = createContext();

// Custom hook — call this anywhere you need the current user or auth functions
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // wait for Firebase to restore session

  // Create account, set display name, and write user doc to Firestore
  async function signUp(email, password, username) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    await updateProfile(user, { displayName: username });

    await setDoc(doc(db, 'users', user.uid), {
      username,
      email,
      createdAt: serverTimestamp(),
    });

    return credential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // Listen for auth state changes (login, logout, page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe; // cleanup listener on unmount
  }, []);

  const value = { currentUser, signUp, login, logout };

  // Don't render children until Firebase has restored the session
  return (
    <AuthContext.Provider value={value}>
      {loading ? <SplashScreen /> : children}
    </AuthContext.Provider>
  );
}
