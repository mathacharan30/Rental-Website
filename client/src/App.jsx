import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers
import { AuthProvider } from "./context/AuthContext";

// Utils
import ProtectedRoute from "./utils/ProtectedRoute";
import ScrollToTop from "./utils/ScrollToTop";

// Layout (keep eagerly loaded — always visible)
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import { Toaster } from "react-hot-toast";

// ── Lazy-loaded pages ───────────────────────────────────
const Home = lazy(() => import("./pages/Main/Home"));
const Login = lazy(() => import("./pages/Main/Login"));
const Signup = lazy(() => import("./pages/Main/Signup"));
const ForgotPassword = lazy(() => import("./pages/Main/ForgotPassword"));
const Products = lazy(() => import("./pages/Main/Products"));
const ProductDetail = lazy(() => import("./pages/Main/ProductDetail"));
const AboutUs = lazy(() => import("./pages/Main/AboutUs"));
const ContactUs = lazy(() => import("./pages/Main/ContactUs"));
const TermsAndConditions = lazy(() => import("./pages/Main/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/Main/DataPolicyPage"));
const RefundPolicy = lazy(() => import("./pages/Main/RefundPolicy"));
const FAQ = lazy(() => import("./pages/Main/FAQ"));
const PaymentStatus = lazy(() => import("./pages/Main/PaymentStatus"));
const CustomerProfile = lazy(() => import("./pages/Main/CustomerProfile"));
const Favorites = lazy(() => import("./pages/Main/Favorites"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const ProductsAdmin = lazy(() => import("./pages/Admin/ProductsAdmin"));
const OrdersAdmin = lazy(() => import("./pages/Admin/OrdersAdmin"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdmin/SuperAdminDashboard"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader />
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen dm-sans tracking-tight bg-[#0e0e0e] text-white">
          <ScrollToTop />
          <Navbar />
          <main>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public ─────────────────────────────── */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:category" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route
                path="/payment/status/:merchantOrderId"
                element={<PaymentStatus />}
              />

              {/* ── Customer ───────────────────────────── */}
              <Route
                path="/:uid/profile"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <Favorites />
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
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="orders" element={<OrdersAdmin />} />
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
            </Suspense>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: "14px",
              padding: "10px 24px",
              borderRadius: 16,
              background: "rgba(20, 20, 20, 0.9)",
              color: "#ffffff",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontFamily: "'DM Sans', sans-serif",
            },
            success: {
              iconTheme: { primary: "#a855f7", secondary: "#ffffff" },
              style: { borderLeft: "3px solid #a855f7" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
              style: { borderLeft: "3px solid #ef4444" },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
