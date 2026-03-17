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
    origin: process.env.CLIENT_ORIGIN,
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

// Start server after DB connection
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
});
