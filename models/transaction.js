const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  fromUser: String,
  toUser: String,

  amount: Number,
  type: String,

  note: String,

  paidAmount: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Transaction", schema);