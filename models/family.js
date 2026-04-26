const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  familyName: String,
  headId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

module.exports = mongoose.model("Family", familySchema);