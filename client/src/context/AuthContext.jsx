/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef(async () => {});

  useEffect(() => {
    let unsubscribe;
    // Dynamically import Firebase SDK so it doesn't block the initial page render
    import("../services/firebaseAuthService").then(
      ({ onAuthChange, fetchMe, logout: firebaseLogout }) => {
        logoutRef.current = async () => {
          await firebaseLogout();
          setFirebaseUser(null);
          setUserProfile(null);
        };

        unsubscribe = onAuthChange(async (fbUser) => {
          setFirebaseUser(fbUser);
          if (fbUser) {
            try {
              const profile = await fetchMe();
              setUserProfile(profile);
            } catch {
              // Don't clear userProfile on transient API failures — only clear
              // when Firebase actually signs the user out (fbUser = null below).
            }
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        });
      }
    );
    return () => unsubscribe?.();
  }, []);

  const logout = () => logoutRef.current();

  const value = {
    firebaseUser,
    userProfile,
    loading,
    logout,
    role: userProfile?.role ?? null,
    storeName: userProfile?.storeName ?? null,
    uid: userProfile?.uid ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
