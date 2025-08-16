import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import serviceRouter from "./routes/serviceRoute.js";
import categoryRouter from "./routes/categoryRoutes.js"
// import userRouter from "./routes/userRoute.js";
import "dotenv/config";
// import DescopeClient from "@descope/node-sdk";
import authRouter from "./routes/authRoute.js";
import mongoose from "mongoose";

// app config
const app = express();
const port = 4000;

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "*", 
  })
);

//db connection
let dbConnection = null;
try {
  dbConnection = await connectDB();
  console.log("DB Connected");
} catch (error) {
  console.error("Database connection error:", error);
}

//api endpoints
app.use("/api/service", serviceRouter);
app.use("/api/category", categoryRouter);
app.use("/images", express.static("uploads"));
app.use("/api/auth", authRouter);

// Enhanced health check endpoint
app.get("/api/health-check", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    let dbStats = null;
    if (dbStatus === "connected") {
      try {
        const stats = await mongoose.connection.db.stats();
        dbStats = {
          collections: stats.collections,
          documents: stats.objects,
        };
      } catch (error) {
        console.error("Error getting DB stats:", error);
      }
    }

    res.status(200).json({
      status: "ok",
      message: "Server is running",
      db: { status: dbStatus, stats: dbStats },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error checking health",
      error: error.message,
    });
  }
});


app.get("/", (req, res) => {
  res.send("API Working");
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("services"); // Populate service details
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// Improved error handling for routes that don't exist
app.use((req, res) => {
  res.status(404).json({ 
    status: "error", 
    message: "Route not found" 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
