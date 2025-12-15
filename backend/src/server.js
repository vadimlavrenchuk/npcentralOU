console.log("Server.js STARTED");

import cors from "cors";
import express from "express";
import mongoose from "mongoose";

// 👉 ДОБАВЬ ЭТО
import { seedInitialData } from "./controllers/inventoryController.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 👉 ДОБАВЬ ЭТО — ПОДКЛЮЧЕНИЕ API
app.use("/api/equipment", equipmentRoutes);
app.use("/api/inventory", inventoryRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const startServer = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/repair_db");
    console.log("MongoDB connected");

    // Ensure inventory has initial data
    try {
      await seedInitialData();
    } catch (err) {
      console.error("Inventory seeding error:", err);
    }

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });

  } catch (error) {
    console.error("DB error:", error);
  }
};

startServer();
