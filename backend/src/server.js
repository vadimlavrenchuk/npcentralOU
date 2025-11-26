console.log("Server.js STARTED");

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// 👉 ДОБАВЬ ЭТО
import equipmentRoutes from "./routes/equipmentRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 👉 ДОБАВЬ ЭТО — ПОДКЛЮЧЕНИЕ API
app.use("/api/equipment", equipmentRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const startServer = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/repair_db");
    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });

  } catch (error) {
    console.error("DB error:", error);
  }
};

startServer();
