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
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));

// ================== DEFAULT ROUTE ==================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================== MONGODB ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err));

// ================== PORT ==================
const PORT = process.env.PORT || 5000;

// 🔥 IMPORTANT → for local network access
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});