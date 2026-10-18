
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutesModule = require("./routes/admin");
const paymentRoutes = require("./routes/payment");
const doubtsRoutes = require("./routes/doubts");
const notificationsRoutes = require("./routes/notifications");

const app = express();

/* ============================================================
   ADMIN ROUTER COMPATIBILITY
============================================================ */

const adminRoutes =
  adminRoutesModule?.router || adminRoutesModule;

/* ============================================================
   UPLOAD DIRECTORY
   Persistent directory: backend/uploads
============================================================ */

const UPLOADS_DIR = path.join(__dirname, "uploads");

try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (error) {
  console.error(
    "Failed to create uploads directory:",
    error.message
  );
  process.exit(1);
}

/* ============================================================
   MIDDLEWARE
============================================================ */

app.disable("x-powered-by");

app.use(cors());

app.use(
  express.json({
    limit: "50mb"
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true
  })
);

/* ============================================================
   PUBLIC NOTICE IMAGE URLS

   Example:
   https://api.pharmaverse.co.in/uploads/notices/example.jpg

   The admin upload route must save files inside this directory
   and store the corresponding public URL in Notice.imageUrl.
============================================================ */

app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    index: false,
    dotfiles: "deny",
    fallthrough: true,
    maxAge: "1d",
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    }
  })
);

/* ============================================================
   ROUTER VALIDATION
============================================================ */

const requiredRouters = [
  ["./routes/auth.js", authRoutes],
  ["./routes/admin.js", adminRoutes],
  ["./routes/payment.js", paymentRoutes],
  ["./routes/doubts.js", doubtsRoutes],
  ["./routes/notifications.js", notificationsRoutes]
];

console.log("");
console.log("=================================");
console.log("PHARMAVERSE ROUTE CHECK");
console.log("=================================");

for (const [file, router] of requiredRouters) {
  console.log(`${file}:`, typeof router);

  if (typeof router !== "function") {
    console.error(
      `ERROR: ${file} is not exporting a valid Express router`
    );
    process.exit(1);
  }
}

console.log("Uploads directory:", UPLOADS_DIR);
console.log("=================================");
console.log("");

/* ============================================================
   ROOT HEALTH CHECK
============================================================ */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PharmaVerse API is running",
    status: "active",
    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      payment: "/api/payment",
      doubts: "/api/doubts",
      notifications: "/api/notifications",
      collections: "/api/collections",
      uploads: "/uploads/"
    }
  });
});

/* ============================================================
   DATABASE COLLECTIONS
============================================================ */

app.get("/api/collections", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1 ||
        !mongoose.connection.db) {
      return res.status(503).json({
        success: false,
        message: "Database not connected"
      });
    }

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    const collectionNames = collections.map(
      (collection) => collection.name
    );

    const counts = {};

    for (const name of collectionNames) {
      counts[name] = await mongoose.connection.db
        .collection(name)
        .countDocuments();
    }

    return res.json({
      success: true,
      database: mongoose.connection.name,
      collections: collectionNames,
      counts,
      totalCollections: collectionNames.length
    });
  } catch (error) {
    console.error("Error fetching collections:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch collections"
    });
  }
});

/* ============================================================
   API ROUTES
============================================================ */

app.use("/api/auth", authRoutes);
console.log("Auth router mounted");

app.use("/api/admin", adminRoutes);
console.log("Admin router mounted");

app.use("/api/payment", paymentRoutes);
console.log("Payment router mounted");

app.use("/api/doubts", doubtsRoutes);
console.log("Doubts router mounted");

app.use("/api/notifications", notificationsRoutes);
console.log("Notifications router mounted");

/* ============================================================
   404 HANDLER
============================================================ */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    requestedUrl: req.originalUrl,
    availableRoutes: [
      "/",
      "/api/auth",
      "/api/admin",
      "/api/payment",
      "/api/doubts",
      "/api/doubts/test/health",
      "/api/notifications",
      "/api/collections",
      "/uploads/"
    ]
  });
});

/* ============================================================
   CENTRAL ERROR HANDLER
============================================================ */

app.use((err, req, res, next) => {
  console.error("EXPRESS ERROR:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  const status = Number(err.status || err.statusCode) || 500;

  return res.status(status).json({
    success: false,
    message:
      status === 413
        ? "Request too large. Please use a smaller image."
        : status >= 500
          ? "Internal Server Error"
          : err.message || "Request failed",
    error:
      process.env.NODE_ENV === "development"
        ? err.stack
        : undefined
  });
});

/* ============================================================
   MONGODB CONNECTION
============================================================ */

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");
    console.log(`Database: ${mongoose.connection.name}`);

    try {
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();

      const collectionNames = collections.map(
        (collection) => collection.name
      );

      console.log(
        "Existing collections:",
        collectionNames.length
          ? collectionNames.join(", ")
          : "(none)"
      );

      if (!collectionNames.includes("admins")) {
        console.log(
          "Admins collection will be created when admin data is saved."
        );
      }

      if (!collectionNames.includes("doubts")) {
        console.log(
          "Doubts collection will be created when the first doubt is saved."
        );
      } else {
        console.log("Doubts collection found");
      }

      if (!collectionNames.includes("notices")) {
        console.log(
          "Notices collection will be created when the first notice is saved."
        );
      } else {
        console.log("Notices collection found");
      }
    } catch (error) {
      console.error(
        "Collection check error:",
        error.message
      );
    }
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error.message
    );
    process.exit(1);
  });

/* ============================================================
   START SERVER
============================================================ */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("");
  console.log("=================================");
  console.log("PharmaVerse Server Running");
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/api/admin`);
  console.log(`Auth: http://localhost:${PORT}/api/auth`);
  console.log(`Payment: http://localhost:${PORT}/api/payment`);
  console.log(`Doubts: http://localhost:${PORT}/api/doubts`);
  console.log(
    `Notifications: http://localhost:${PORT}/api/notifications`
  );
  console.log(
    `Uploads: http://localhost:${PORT}/uploads/`
  );
  console.log("=================================");
  console.log("");
});

/* ============================================================
   GRACEFUL SHUTDOWN
============================================================ */

let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(
    `\n${signal} received. Shutting down server...`
  );

  server.close(async () => {
    console.log("HTTP server closed");

    try {
      await mongoose.disconnect();
      console.log("MongoDB connection closed");
      process.exit(0);
    } catch (error) {
      console.error(
        "MongoDB close error:",
        error.message
      );
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
