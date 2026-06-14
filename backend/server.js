const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payment");

const app = express();

// ================= CORS - FIXED FOR NEW EXPRESS =================
const allowedOrigins = [
  'https://admin.pharmaverse.co.in',
  'https://pharmaverse.co.in',
  'http://localhost:8085',
  'http://localhost:3000',
  'http://localhost:5000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, true); // Still allow but log
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// ================= MIDDLEWARE =================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= REQUEST LOGGER =================
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.json({ 
    message: "PharmaVerse API Running 🚀",
    status: "active",
    time: new Date().toISOString()
  });
});

// ================= TEST CORS ROUTE =================
app.get("/api/test-cors", (req, res) => {
  res.json({ 
    success: true, 
    message: "CORS is working!",
    origin: req.headers.origin 
  });
});

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    url: req.originalUrl
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ================= MONGODB + SERVER START =================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`\n=================================`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`=================================\n`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });