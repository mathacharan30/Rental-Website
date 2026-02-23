// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, fetchMe, logout as firebaseLogout } from '../services/firebaseAuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [userProfile,  setUserProfile]  = useState(null);      // MongoDB profile
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await fetchMe();
          setUserProfile(profile);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseLogout();
    setFirebaseUser(null);
    setUserProfile(null);
  };

  const value = {
    firebaseUser,
    userProfile,
    loading,
    logout,
    role:      userProfile?.role      ?? null,
    storeName: userProfile?.storeName ?? null,
    uid:       userProfile?.uid       ?? null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
