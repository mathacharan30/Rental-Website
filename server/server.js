process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const productRoutes = require('./routes/productRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const instaRoutes = require('./routes/instaRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Cloth Rental Backend Running…');
});

// API routes
app.use('/api/products', productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/insta', instaRoutes);
app.use('/api/auth', authRoutes); // unified login/register for users & admins
app.use('/api/categories', categoryRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Start server after DB connection
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
});
