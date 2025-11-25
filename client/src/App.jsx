import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Main/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Main/Login";
import Signup from "./pages/Main/Signup";
import Products from "./pages/Main/Products";
import ProductDetail from "./pages/Main/ProductDetail";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/Dashboard";
import ProductsAdmin from "./pages/Admin/ProductsAdmin";
import TestimonialsAdmin from "./pages/Admin/TestimonialsAdmin";
import CategoriesAdmin from "./pages/Admin/CategoriesAdmin";
import HeroImagesAdmin from "./pages/Admin/HeroImagesAdmin";
import InstaAdmin from "./pages/Admin/InstaAdmin";
import ScrollToTop from "./utils/ScrollToTop";
import { Toaster } from "react-hot-toast";
const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen dm-sans border-4 border-black tracking-tight bg-[#f7f7f7]">
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:category" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="testimonials" element={<TestimonialsAdmin />} />
              <Route path="hero-images" element={<HeroImagesAdmin />} />
              <Route path="gallery" element={<InstaAdmin />} />
            </Route>
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
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ffffff",
            },
            style: {
              borderLeft: "4px solid #22c55e",
              borderRight: "4px solid #22c55e",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
            style: {
              borderLeft: "4px solid #ef4444",
              borderRight: "4px solid #ef4444",
            },
          },
        }}
      />
    </BrowserRouter>
  );
};

export default App;
