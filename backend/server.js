const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payment"); // 🔥 PAYMENT ROUTES ADD KARO

const app = express();

// ================= MIDDLEWARE =================

// CORS
app.use(cors());

// IMPORTANT FIX FOR 413 ERROR (Large file uploads)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// STATIC FOLDER FOR FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.json({ 
    message: "PharmaVerse API is running 🚀",
    status: "active",
    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      payment: "/api/payment"
    }
  });
});

// ================= CHECK ALL COLLECTIONS ROUTE =================
app.get("/api/collections", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Get counts for each collection
    const counts = {};
    for (const name of collectionNames) {
      const count = await mongoose.connection.db.collection(name).countDocuments();
      counts[name] = count;
    }
    
    res.json({ 
      success: true,
      database: mongoose.connection.name,
      collections: collectionNames,
      counts: counts,
      totalCollections: collectionNames.length
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes); // 🔥 PAYMENT ROUTES REGISTER KARO

// ================= FIXED: 404 Handler =================
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    requestedUrl: req.originalUrl,
    availableRoutes: ["/", "/api/auth", "/api/admin", "/api/payment", "/api/collections"]
  });
});

// ================= ERROR HANDLING MIDDLEWARE =================
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// ================= MONGODB CONNECTION =================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📁 Database: ${mongoose.connection.name}`);
    
    // Log all collections after connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("📚 Existing collections:", collectionNames.join(", ") || "(none)");
    
    if (!collectionNames.includes('admins')) {
      console.log("⚠️ 'admins' collection not found yet - will be created on first admin login");
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("\n=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log("=================================");
  console.log("\n📡 Available Endpoints:");
  console.log(`   🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`   👑 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`   💳 Payment API: http://localhost:${PORT}/api/payment`);
  console.log(`   📄 Test: http://localhost:${PORT}/`);
  console.log(`   📚 Collections: http://localhost:${PORT}/api/collections`);
  console.log("\n=================================\n");
});

// ================= GRACEFUL SHUTDOWN =================
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
   process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");

  server.close(async () => {
    console.log("✅ Server closed");

    await mongoose.connection.close();

    console.log("✅ MongoDB connection closed");
    process.exit(0);
  });
});
  });
});