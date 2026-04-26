const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userName: String,
  title: String,        // Bike, House
  targetAmount: Number,
  savedAmount: { type: Number, default: 0 },
  status: { type: String, default: "active" } // active / completed
}, { timestamps: true });

module.exports = mongoose.model("Goal", schema);