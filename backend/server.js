const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutesModule = require("./routes/admin");
const paymentRoutes = require("./routes/payment");

const app = express();

/* ============================================================
   ADMIN ROUTER FIX
   ============================================================

   admin.js agar:
       module.exports = router;

   export karta hai to direct router milega.

   Aur agar:
       module.exports = { router, adminAuth };

   export karta hai to object milega.

   Dono ko support kar rahe hain.
   ============================================================ */

const adminRoutes =
  adminRoutesModule?.router || adminRoutesModule;


/* ============================================================
   MIDDLEWARE
   ============================================================ */

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
   ROUTE TYPE CHECK
   ============================================================ */

console.log("");
console.log("=================================");
console.log("🔍 PHARMAVERSE ROUTE CHECK");
console.log("=================================");

console.log(
  "authRoutes    =",
  typeof authRoutes
);

console.log(
  "adminRoutesModule =",
  typeof adminRoutesModule
);

console.log(
  "adminRoutes   =",
  typeof adminRoutes
);

console.log(
  "paymentRoutes =",
  typeof paymentRoutes
);

console.log("=================================");
console.log("");


/* ============================================================
   SAFETY CHECK
   ============================================================ */

if (typeof authRoutes !== "function") {
  console.error(
    "❌ ERROR: ./routes/auth.js is not exporting a router"
  );

  process.exit(1);
}

if (typeof adminRoutes !== "function") {
  console.error(
    "❌ ERROR: ./routes/admin.js is not exporting a valid router"
  );

  console.error(
    "adminRoutesModule:",
    adminRoutesModule
  );

  process.exit(1);
}

if (typeof paymentRoutes !== "function") {
  console.error(
    "❌ ERROR: ./routes/payment.js is not exporting a router"
  );

  process.exit(1);
}


/* ============================================================
   TEST ROUTE
   ============================================================ */

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "PharmaVerse API is running 🚀",
    status: "active",

    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      payment: "/api/payment",
      collections: "/api/collections"
    }
  });

});


/* ============================================================
   DATABASE COLLECTIONS ROUTE
   ============================================================ */

app.get("/api/collections", async (req, res) => {

  try {

    if (!mongoose.connection.db) {

      return res.status(503).json({
        success: false,
        message: "Database not connected"
      });

    }

    const collections =
      await mongoose.connection.db
        .listCollections()
        .toArray();

    const collectionNames =
      collections.map(
        collection => collection.name
      );

    const counts = {};

    for (const name of collectionNames) {

      counts[name] =
        await mongoose.connection.db
          .collection(name)
          .countDocuments();

    }

    res.json({
      success: true,
      database: mongoose.connection.name,
      collections: collectionNames,
      counts,
      totalCollections:
        collectionNames.length
    });

  } catch (error) {

    console.error(
      "❌ Error fetching collections:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch collections",
      error: error.message
    });

  }

});


/* ============================================================
   API ROUTES
   ============================================================ */

app.use(
  "/api/auth",
  authRoutes
);

console.log(
  "✅ Auth router mounted"
);


app.use(
  "/api/admin",
  adminRoutes
);

console.log(
  "✅ Admin router mounted"
);


app.use(
  "/api/payment",
  paymentRoutes
);

console.log(
  "✅ Payment router mounted"
);


/* ============================================================
   404 HANDLER
   ============================================================ */

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "Route not found",

    requestedUrl:
      req.originalUrl,

    availableRoutes: [
      "/",
      "/api/auth",
      "/api/admin",
      "/api/payment",
      "/api/collections"
    ]

  });

});


/* ============================================================
   ERROR HANDLER
   ============================================================ */

app.use(
  (err, req, res, next) => {

    console.error(
      "❌ EXPRESS ERROR:",
      err
    );

    res.status(
      err.status || 500
    ).json({

      success: false,

      message:
        err.message ||
        "Internal Server Error",

      error:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined

    });

  }
);


/* ============================================================
   MONGODB CONNECTION
   ============================================================ */

mongoose
  .connect(
    process.env.MONGODB_URI
  )

  .then(async () => {

    console.log(
      "✅ MongoDB connected successfully"
    );

    console.log(
      `📁 Database: ${mongoose.connection.name}`
    );

    try {

      const collections =
        await mongoose.connection.db
          .listCollections()
          .toArray();

      const collectionNames =
        collections.map(
          collection => collection.name
        );

      console.log(
        "📚 Existing collections:",
        collectionNames.length
          ? collectionNames.join(", ")
          : "(none)"
      );

      if (
        !collectionNames.includes(
          "admins"
        )
      ) {

        console.log(
          "⚠️ admins collection not found yet"
        );

        console.log(
          "It will be created automatically when admin data is saved."
        );

      }

    } catch (error) {

      console.error(
        "❌ Collection check error:",
        error.message
      );

    }

  })

  .catch((error) => {

    console.error(
      "❌ MongoDB connection error:",
      error.message
    );

    process.exit(1);

  });


/* ============================================================
   SERVER
   ============================================================ */

const PORT =
  process.env.PORT || 5000;


const server =
  app.listen(
    PORT,
    () => {

      console.log("");
      console.log(
        "================================="
      );

      console.log(
        `🚀 PharmaVerse Server Running`
      );

      console.log(
        `📍 Local: http://localhost:${PORT}`
      );

      console.log(
        `📍 Admin: http://localhost:${PORT}/api/admin`
      );

      console.log(
        `📍 Upload: http://localhost:${PORT}/api/admin/upload`
      );

      console.log(
        `📍 Auth: http://localhost:${PORT}/api/auth`
      );

      console.log(
        `📍 Payment: http://localhost:${PORT}/api/payment`
      );

      console.log(
        "================================="
      );

      console.log("");

    }
  );


/* ============================================================
   GRACEFUL SHUTDOWN
   ============================================================ */

process.on(
  "SIGINT",
  async () => {

    console.log(
      "\n🛑 Shutting down server..."
    );

    server.close(
      async () => {

        console.log(
          "✅ HTTP server closed"
        );

        try {

          await mongoose.connection.close();

          console.log(
            "✅ MongoDB connection closed"
          );

          process.exit(0);

        } catch (error) {

          console.error(
            "❌ MongoDB close error:",
            error.message
          );

          process.exit(1);

        }

      }
    );

  }
);