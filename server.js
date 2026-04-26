const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

// ================== MIDDLEWARE ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== STATIC FILES ==================
app.use(express.static(path.join(__dirname, "public")));

// ================== ROUTES ==================
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const goalRoutes = require("./routes/goalRoutes");

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/goals", goalRoutes);

// ================== DEFAULT ROUTE ==================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================== ERROR HANDLING ==================
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === "development" ? err.message : {} 
  });
});

// ================== MONGODB ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`✅ MongoDB Connected to: ${mongoose.connection.name}`))
  .catch(err => console.error("❌ Mongo Connection Error:", err));

// ================== PORT ==================
const PORT = process.env.PORT || 5000;

// 🔥 IMPORTANT → for local network access
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});