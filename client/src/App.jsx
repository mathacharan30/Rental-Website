import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers
import { AuthProvider }  from "./context/AuthContext";

// Utils
import ProtectedRoute    from "./utils/ProtectedRoute";
import ScrollToTop       from "./utils/ScrollToTop";

// Public pages
import Home              from "./pages/Main/Home";
import Login             from "./pages/Main/Login";
import Signup            from "./pages/Main/Signup";
import ForgotPassword    from "./pages/Main/ForgotPassword";
import Products          from "./pages/Main/Products";
import ProductDetail     from "./pages/Main/ProductDetail";

// Customer pages
import CustomerProfile   from "./pages/Main/CustomerProfile";

// Store-owner (admin) pages
import AdminDashboard    from "./pages/Admin/Dashboard";
import ProductsAdmin     from "./pages/Admin/ProductsAdmin";
import TestimonialsAdmin from "./pages/Admin/TestimonialsAdmin";
import CategoriesAdmin   from "./pages/Admin/CategoriesAdmin";
import HeroImagesAdmin   from "./pages/Admin/HeroImagesAdmin";
import InstaAdmin        from "./pages/Admin/InstaAdmin";

// Super admin pages
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";

// Layout
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen dm-sans border-4 border-black tracking-tight bg-[#f7f7f7]">
          <ScrollToTop />
          <Navbar />
          <main>
            <Routes>
              {/* ── Public ─────────────────────────────── */}
              <Route path="/"                  element={<Home />} />
              <Route path="/login"             element={<Login />} />
              <Route path="/signup"            element={<Signup />} />
              <Route path="/forgot-password"   element={<ForgotPassword />} />
              <Route path="/products"          element={<Products />} />
              <Route path="/products/:category" element={<Products />} />
              <Route path="/product/:id"       element={<ProductDetail />} />

              {/* ── Customer ───────────────────────────── */}
              <Route
                path="/:uid/profile"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />

              {/* ── Store owner admin (/admin/:storename) ─ */}
              <Route
                path="/admin/:storename/*"
                element={
                  <ProtectedRoute allowedRoles={["store_owner", "super_admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="products"    element={<ProductsAdmin />} />
                <Route path="categories"  element={<CategoriesAdmin />} />
                <Route path="testimonials" element={<TestimonialsAdmin />} />
                <Route path="hero-images" element={<HeroImagesAdmin />} />
                <Route path="gallery"     element={<InstaAdmin />} />
              </Route>

              {/* ── Super admin ─────────────────────────── */}
              <Route
                path="/superadmin/*"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: "14px",
              padding: "10px 24px",
              borderRadius: 50,
              background: "rgba(255, 255, 255)",
              color: "#000000",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(16px)",
              border: "1px solid #e0e0e0",
              fontFamily: "'DM Sans', sans-serif",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#ffffff" },
              style: { borderLeft: "4px solid #22c55e", borderRight: "4px solid #22c55e" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
              style: { borderLeft: "4px solid #ef4444", borderRight: "4px solid #ef4444" },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
