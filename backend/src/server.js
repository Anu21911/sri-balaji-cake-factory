require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { initSocket } = require('./sockets/socketHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customCakeRoutes = require('./routes/customCakeRoutes');
const customerDbRoutes = require('./routes/customerDbRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const server = http.createServer(app);

// Initialize real-time Socket.IO
const io = initSocket(server);

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static assets (Product photos and uploaded custom cake designs)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    businessName: 'Sri Balaji Cake Factory',
    location: 'SangaReddy Road, Narsapur',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-cakes', customCakeRoutes);
app.use('/api/owner/customers', customerDbRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Serve Frontend in production if built
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/images') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexFile = path.join(frontendDist, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Sri Balaji Cake Factory API</title></head>
          <body style="font-family:sans-serif; text-align:center; padding:50px; background:#fff8f0; color:#5c3a21;">
            <h1>Sri Balaji Cake Factory Backend API</h1>
            <p>SangaReddy Road, Narsapur | Phone: 9963390327</p>
            <p style="color:#2e7d32; font-weight:bold;">API Server is running on port ${process.env.PORT || 5000}</p>
            <p>Run frontend development server on port 5173 (<code>npm run dev:frontend</code>)</p>
          </body>
        </html>
      `);
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Sri Balaji Cake Factory] Server running on http://localhost:${PORT}`);
  console.log(`[Portals] Customer Portal & Owner Portal active.`);
});
