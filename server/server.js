require("dotenv").config();

// ── Startup env validation — fail fast if critical vars are missing ────────────
const REQUIRED_ENV = [
  "MONGODB_URI",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "CLIENT_ORIGIN",
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_USER",
  "MAIL_PASS",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "S3_BUCKET_NAME",
  "PHONEPE_CLIENT_ID",
  "PHONEPE_CLIENT_SECRET",
];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error(`[Server] FATAL – missing required env vars: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// ── Process crash guards ───────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("[Process] Uncaught Exception:", err.message, err.stack);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Process] Unhandled Rejection:", reason);
  process.exit(1);
});

const express    = require("express");
const cors       = require("cors");
const compression = require("compression");
const helmet     = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit  = require("express-rate-limit");
const morgan     = require("morgan");
const connectDB  = require("./config/db");

const productRoutes          = require("./routes/productRoutes");
const bannerRoutes           = require("./routes/bannerRoutes");
const instaRoutes            = require("./routes/instaRoutes");
const authRoutes             = require("./routes/authRoutes");
const categoryRoutes         = require("./routes/categoryRoutes");
const testimonialRoutes      = require("./routes/testimonialRoutes");
const superAdminRoutes       = require("./routes/superAdminRoutes");
const productTestimonialRoutes = require("./routes/productTestimonialRoutes");
const orderRoutes            = require("./routes/orderRoutes");
const paymentRoutes          = require("./routes/paymentRoutes");
const favoriteRoutes            = require("./routes/favoriteRoutes");
const makeupCategoryRoutes      = require("./routes/makeupCategoryRoutes");
const makeupPackageRoutes       = require("./routes/makeupPackageRoutes");
const { getCities }             = require("./controllers/superAdminController");

const app = express();

// Trust Vercel's reverse proxy so express-rate-limit reads the real client IP
// from X-Forwarded-For instead of the proxy's IP.
app.set("trust proxy", 1);
app.set("etag", false);

// ── Server-to-server routes registered BEFORE global middleware ────────────────
// PhonePe webhook and sync-pending must accept cross-origin server calls.
app.use("/api/payment/webhook", cors({ origin: "*" }));

// ── HTTP request logging ───────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── 1. CORS — must run early so the header is present even on error responses ─
const allowedOrigins = process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, server-to-server, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ── 2. Security headers (Helmet) ──────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc:    ["'self'"],
        objectSrc:  ["'none'"],
        frameSrc:   ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard:  { action: "deny" },
    noSniff:     true,
  })
);

// ── 3. NoSQL injection protection ─────────────────────────────────────────────
// Express 5 makes req.query a readonly getter — mongoSanitize() tries to replace
// it entirely and throws. Sanitise only req.body (the only user-controlled input
// that reaches MongoDB) to stay compatible with Express 5.
app.use((req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, { allowDots: true });
  next();
});

// ── 4. Rate limiting ──────────────────────────────────────────────────────────
// Note: hpp (HTTP Parameter Pollution) is omitted — it also tries to rewrite
// req.query and crashes under Express 5.
// Strict limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many auth requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { message: "Too many requests from this IP. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => req.path.startsWith("/api/payment/webhook"), // skip webhook
});

app.use("/api/auth", authLimiter);
app.use(generalLimiter);

// ── 5. Body parsing — strict 10 KB limit on JSON ─────────────────────────────
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: true }));

// ── DB readiness guard — ensures connection is live before any route runs ─────
// Critical for Vercel serverless: requests can arrive before connectDB() resolves.
// connectDB() is idempotent (skips if already connected), so this is cheap on
// warm instances and correctly awaits on cold starts.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[Server] DB not ready:", err.message);
    res.status(503).json({ message: "Service temporarily unavailable. Please retry." });
  }
});

// ── Root health-check ─────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Cloth Rental Backend" });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/products",              productRoutes);
app.use("/api/banners",               bannerRoutes);
app.use("/api/insta",                 instaRoutes);
app.use("/api/auth",                  authRoutes);
app.use("/api/categories",            categoryRoutes);
app.use("/api/testimonials",          testimonialRoutes);
app.use("/api/product-testimonials",  productTestimonialRoutes);
app.use("/api/superadmin",            superAdminRoutes);
app.use("/api/orders",                orderRoutes);
app.use("/api/payment",               paymentRoutes);
app.use("/api/favorites",             favoriteRoutes);
app.use("/api/makeup-categories",     makeupCategoryRoutes);
app.use("/api/makeup-packages",       makeupPackageRoutes);
app.get("/api/cities",                getCities); // public — delivery city dropdown

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global error handler (must be LAST middleware) ────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  // Never expose internal stack traces in production
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message;
  if (process.env.NODE_ENV !== "production") {
    console.error("[Error]", err.stack);
  } else {
    console.error("[Error]", err.message);
  }
  res.status(statusCode).json({ message });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Server] Running on port ${PORT}`);
  }
  // Attempt eager DB connection on startup — if it fails the per-request
  // middleware retries automatically on every incoming request.
  connectDB().catch((err) =>
    console.error("[Server] Eager DB connect failed (will retry per-request):", err.message)
  );
});

module.exports = app;
