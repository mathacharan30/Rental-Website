process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const instaRoutes = require("./routes/instaRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();

// ── Webhook route MUST be registered before the global CORS + body-parser
// middlewares.  PhonePe calls it server-to-server (not from a browser), so
// it must accept requests from any origin.  The paymentRoutes file applies
// its own express.json({ verify }) middleware to capture the raw body.
app.use('/api/payment/webhook', cors({ origin: '*' }));

// Middleware
app.use(
  cors({
    // Allow the configured client origin; fall back to the production domain
    // so the app keeps working even if CLIENT_ORIGIN is not set in Vercel.
    origin: process.env.CLIENT_ORIGIN || 'https://rental-website-6a9i.vercel.app',
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Root route
app.get("/", (req, res) => {
  res.send("Cloth Rental Backend Running…");
});

// API routes
app.use("/api/products", productRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/insta", instaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/favorites", favoriteRoutes);

// Connect to DB immediately when this module loads.
// Mongoose caches the connection so warm Vercel serverless instances reuse it.
// If running locally (require.main === module) we exit on failure so the
// developer knows immediately; in serverless we just log and let Vercel retry.
if (require.main === module) {
  // ── Local development ────────────────────────────────────────────────────
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[Server] Running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('[DB] Startup failed:', err.message);
      process.exit(1);
    });
} else {
  // ── Vercel serverless ────────────────────────────────────────────────────
  // Kick off the connection; Mongoose queues queries until it resolves.
  connectDB().catch((err) =>
    console.error('[DB] Initial connection failed:', err.message)
  );
}

module.exports = app;
