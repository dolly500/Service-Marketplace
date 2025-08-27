import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import serviceRouter from "./routes/serviceRoute.js";
import categoryRouter from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"
import "dotenv/config";
import authRouter from "./routes/authRoute.js";
import bookingRouter from "./routes/bookingRouter.js";
import mongoose from "mongoose";


const app = express();
const port = 4000;

app.use('/api/payments/webhook', paymentRoutes);

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.set("json spaces", 2);

// routes

app.use('/api/payments', paymentRoutes);
app.use("/api/service", serviceRouter);
app.use("/api/category", categoryRouter);
app.use("/api/booking", bookingRouter);
app.use("/images", express.static("uploads"));
app.use("/api/auth", authRouter);


// health check
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
    const orders = await Order.find().populate("services");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

// ✅ Proper startup
const startServer = async () => {
  try {
    await connectDB();
    console.log("DB Connected");

    app.listen(port, () => {
      console.log(`Server Started on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

startServer();
