const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  phone: String,
  familyName: String,

  balance: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },

  role: { type: String, default: "member" } // ✅ correct
});

module.exports = mongoose.model("User", schema);