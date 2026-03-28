process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const instaRoutes = require("./routes/instaRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const productTestimonialRoutes = require("./routes/productTestimonialRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const { getCities }  = require("./controllers/superAdminController");

const app = express();

// These routes are called server-to-server (PhonePe webhook, cron jobs) so
// they must accept requests from any origin — registered before global CORS.
app.use('/api/payment/webhook', cors({ origin: '*' }));
app.use('/api/payment/sync-pending', cors({ origin: '*' }));

// Middleware
app.use(compression());
const allowedOrigins = process.env.CLIENT_ORIGIN.split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
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
app.use("/api/product-testimonials", productTestimonialRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.get("/api/cities", getCities);       // public – delivery city dropdown

// Start server after DB connection
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
});

module.exports = app;
