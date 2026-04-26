const User = require("../models/User");
const Transaction = require("../models/transaction");


// 👤 MEMBER LOGIN
const login = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    res.json({ user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 👑 ADMIN LOGIN
const adminLogin = (req, res) => {
  const { familyName, password } = req.body;

  if (password === "1234") {
    return res.json({ success: true, familyName });
  }

  res.status(401).json({ error: "Invalid admin login" });
};


// ➕ CREATE MEMBER
const createMember = async (req, res) => {
  try {
    const { name, phone, familyName } = req.body;

    if (!name || !phone || !familyName) {
      return res.status(400).json({ error: "All fields required" });
    }

    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await User.create({
      name,
      phone,
      familyName,
      balance: 0,
      role: "member"
    });

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📊 GET USERS (by family)
const getUsers = async (req, res) => {
  try {
    const { familyName } = req.query;

    const users = await User.find({ familyName });

    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ DELETE USER
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✏️ UPDATE USER
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📊 MEMBER DETAILS (income/expense/transfer)
const getMemberDetails = async (req, res) => {
  try {
    const { familyName } = req.query;

    const users = await User.find({ familyName });

    const result = [];

    for (let user of users) {
      const txns = await Transaction.find({
        $or: [
          { fromUser: user.name },
          { toUser: user.name }
        ]
      });

      let income = 0;
      let expense = 0;
      let transfer = 0;

      txns.forEach(t => {
        if (t.type === "income" && t.toUser === user.name) {
          income += t.amount;
        }

        if (t.type === "expense" && t.fromUser === user.name) {
          expense += t.amount;
        }

        if (t.type === "transfer") {
          transfer += t.amount;
        }
      });

      result.push({
        ...user.toObject(),
        income,
        expense,
        transfer
      });
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📜 MEMBER TRANSACTION HISTORY
const getMemberTransactions = async (req, res) => {
  try {
    const { name } = req.params;

    const txns = await Transaction.find({
      $or: [
        { fromUser: name },
        { toUser: name }
      ]
    }).sort({ createdAt: -1 });

    res.json(txns);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  login,
  adminLogin,
  createMember,
  getUsers,
  deleteUser,
  updateUser,
  getMemberDetails,
  getMemberTransactions
};