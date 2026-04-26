const User = require("../models/user"); // Lowercase as requested

// 🔑 LOGIN
exports.login = async (req, res) => {
  try {
    const { name, familyName } = req.body;
    const user = await User.findOne({ name, familyName });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// 🔑 ADMIN LOGIN
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Simple logic for admin demo
    if (username === "admin" && password === "admin123") {
      return res.json({ success: true, role: "admin" });
    }
    res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// GET /api/users/details
exports.getUsersDetails = async (req, res) => {
  try {
    const { familyName } = req.query;
    // Filter by family if provided, otherwise return all
    const filter = familyName ? { familyName } : {};
    const users = await User.find(filter).lean();
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

    const newUser = new User({ 
      name, 
      familyName,
      balance: 0,
      savings: 0 
    });
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
    const users = await User.find().lean();
    res.json(users || []);
  } catch (err) {
    console.error("❌ getAllUsers Error:", err);
    res.status(500).json([]);
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// GET /api/users/transactions/:name
exports.getMemberTransactions = async (req, res) => {
  try {
    const Transaction = require("../models/transaction");
    const txns = await Transaction.find({ 
      $or: [{ fromUser: req.params.name }, { toUser: req.params.name }] 
    }).sort({ createdAt: -1 });
    res.json(txns || []);
  } catch (err) { res.status(500).json([]); }
};