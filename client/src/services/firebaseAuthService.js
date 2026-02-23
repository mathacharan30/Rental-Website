// src/services/firebaseAuthService.js
// Wraps Firebase Auth client SDK methods and backend calls.

import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

// ─── Sign in ─────────────────────────────────────────────────────────────────
export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────
export async function logout() {
  await signOut(auth);
}

// ─── Forgot password ─────────────────────────────────────────────────────────
export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
}

// ─── Get current Firebase ID token ───────────────────────────────────────────
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// ─── Fetch user role + profile from backend ──────────────────────────────────
// Calls GET /api/auth/me with a fresh Firebase ID token.
export async function fetchMe() {
  const token = await getIdToken();
  if (!token) return null;
  const { data } = await api.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.user; // { uid, email, role, storeName, name, phone, address }
}

// ─── Auth state observer ─────────────────────────────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
