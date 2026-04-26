const User = require("../models/user"); // Lowercase as requested

// GET /api/users/details
exports.getUsersDetails = async (req, res) => {
  try {
    const users = await User.find().lean();
    // Always return an array to prevent frontend .map() crashes
    res.json(users || []);
  } catch (err) {
    console.error("❌ getUsersDetails Error:", err);
    res.status(500).json([]); // Return empty array on failure to prevent crash
  }
};

// POST /api/users/create
exports.createUser = async (req, res) => {
  try {
    const { name, familyName } = req.body;

    // Validation
    if (!name || !familyName) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and Family Name are required." 
      });
    }

    const newUser = new User({ name, familyName });
    await newUser.save();

    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (err) {
    console.error("❌ createUser Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users (Default index)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users || []);
  } catch (err) {
    console.error("❌ getAllUsers Error:", err);
    res.status(500).json([]);
  }
};