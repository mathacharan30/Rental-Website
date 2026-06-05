import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./utils/ProtectedRoute";
import ScrollToTop from "./utils/ScrollToTop";
import ComingSoonGate from "./utils/ComingSoonGate";

import Navbar from "./features/shared/components/Navbar";
import Loader from "./features/shared/components/Loader";
import { Toaster } from "react-hot-toast";

const Home = lazy(() => import("./features/public/pages/Home"));
const Login = lazy(() => import("./features/public/pages/Login"));
const Signup = lazy(() => import("./features/public/pages/Signup"));
const ForgotPassword = lazy(
  () => import("./features/public/pages/ForgotPassword"),
);
const Products = lazy(() => import("./features/public/pages/Products"));
const ProductDetail = lazy(
  () => import("./features/public/pages/ProductDetail"),
);
const BridalCombo = lazy(() => import("./features/public/pages/BridalCombo"));
const AboutUs = lazy(() => import("./features/public/pages/AboutUs"));
const ContactUs = lazy(() => import("./features/public/pages/ContactUs"));
const TermsAndConditions = lazy(
  () => import("./features/public/pages/TermsAndConditions"),
);
const PrivacyPolicy = lazy(
  () => import("./features/public/pages/DataPolicyPage"),
);
const RefundPolicy = lazy(() => import("./features/public/pages/RefundPolicy"));
const FAQ = lazy(() => import("./features/public/pages/FAQ"));
const PaymentStatus = lazy(
  () => import("./features/public/pages/PaymentStatus"),
);
const CustomerProfile = lazy(
  () => import("./features/public/pages/CustomerProfile"),
);
const Favorites = lazy(() => import("./features/public/pages/Favorites"));
const AdminDashboard = lazy(() => import("./features/admin/pages/Dashboard"));
const ProductsAdmin = lazy(
  () => import("./features/admin/pages/ProductsAdmin"),
);
const OrdersAdmin = lazy(() => import("./features/admin/pages/OrdersAdmin"));
const SuperAdminDashboard = lazy(
  () => import("./features/super-admin/SuperAdminDashboard"),
);
const ComingSoon = lazy(() => import("./features/public/pages/ComingSoon"));
const ServiceLandingPage = lazy(
  () => import("./features/public/pages/ServiceLandingPage"),
);

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader />
  </div>
);

// Hides the HTML splash loader exactly once after the first lazy chunk resolves.
// Must live inside Suspense so it only mounts after the fallback clears.
const HideLoaderOnce = () => {
  const done = React.useRef(false);
  React.useEffect(() => {
    if (!done.current && typeof window.__hideLoader === "function") {
      window.__hideLoader();
      done.current = true;
    }
  }, []);
  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ComingSoonGate>
          <div className="min-h-screen dm-sans tracking-tight rounded-2xl bg-[#0a0a0a] text-white">
            <ScrollToTop />
            <Navbar />
            <main>
              <Suspense fallback={<PageLoader />}>
                <HideLoaderOnce />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:category" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/combos/:slug" element={<BridalCombo />} />
                  <Route path="/rental-clothing-mysuru" element={<ServiceLandingPage />} />
                  <Route path="/rental-clothing-bangalore" element={<ServiceLandingPage />} />
                  <Route path="/rental-jewellery-mysuru" element={<ServiceLandingPage />} />
                  <Route path="/rental-jewellery-bangalore" element={<ServiceLandingPage />} />
                  <Route path="/makeup-services-mysuru" element={<ServiceLandingPage />} />
                  <Route path="/makeup-services-bangalore" element={<ServiceLandingPage />} />
                  <Route path="/photography-services-mysuru" element={<ServiceLandingPage />} />
                  <Route path="/photography-services-bangalore" element={<ServiceLandingPage />} />
                  <Route path="/bridal-package-mysuru" element={<ServiceLandingPage />} />
                  <Route path="/bridal-package-bangalore" element={<ServiceLandingPage />} />

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

                  <Route
                    path="/admin/:storename/*"
                    element={
                      <ProtectedRoute
                        allowedRoles={["store_owner", "super_admin"]}
                      >
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="products" element={<ProductsAdmin />} />
                    <Route path="orders" element={<OrdersAdmin />} />
                  </Route>

                  <Route
                    path="/superadmin/*"
                    element={
                      <ProtectedRoute allowedRoles={["super_admin"]}>
                        <SuperAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  {/* Astro-handled routes — return null so React Router doesn't warn */}
                  <Route path="/sitemap.xml" element={null} />
                  <Route path="/robots.txt" element={null} />
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
        </ComingSoonGate>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
