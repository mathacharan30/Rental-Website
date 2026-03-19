// src/utils/ComingSoonGate.jsx
//
// When VITE_COMING_SOON=true, this gate wraps the entire app.
// - The /login path is ALWAYS allowed through so admins can authenticate.
// - Super admins and store owners bypass the gate after login → full app.
// - Every other visitor (unauthenticated or customers) sees ComingSoon.
//
// Toggle: set VITE_COMING_SOON=false (or remove it) to open the site to everyone.

import React, { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const ComingSoon = lazy(() => import("../pages/Main/ComingSoon"));

const COMING_SOON = import.meta.env.VITE_COMING_SOON === "true";

/** Roles that are allowed through even when coming-soon mode is on. */
const BYPASS_ROLES = ["super_admin", "store_owner"];

/** Paths always allowed through so admins can log in. */
const BYPASS_PATHS = ["/login", "/forgot-password"];

const ComingSoonGate = ({ children }) => {
  const { loading, role } = useAuth();
  const { pathname } = useLocation();

  // If the feature flag is off, render everything normally.
  if (!COMING_SOON) return children;

  // Always let login / forgot-password through so admins can authenticate.
  if (BYPASS_PATHS.some((p) => pathname.startsWith(p))) return children;

  // While Firebase resolves the user, show a spinner so we don't
  // flash the coming-soon page to a logged-in admin on first load.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Admins / store owners get the full app.
  if (role && BYPASS_ROLES.includes(role)) return children;

  // Everyone else → coming soon.
  return (
    <div className="min-h-screen dm-sans tracking-tight bg-[#0e0e0e] text-white">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader />
          </div>
        }
      >
        <ComingSoon />
      </Suspense>
    </div>
  );
};

export default ComingSoonGate;
