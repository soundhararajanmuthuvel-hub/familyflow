const User = require("../models/user");
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
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 👑 ADMIN LOGIN
const adminLogin = (req, res) => {
  try {
    const { familyName, password } = req.body;

    if (!familyName || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (password === "1234") {
      return res.json({ success: true, familyName });
    }

    res.status(401).json({ error: "Invalid admin login" });

  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
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
      savings: 0,
      role: "member"
    });

    res.json(user);

  } catch (err) {
    console.error("CREATE MEMBER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 📊 GET USERS
const getUsers = async (req, res) => {
  try {
    const { familyName } = req.query;

    if (!familyName) {
      return res.status(400).json({ error: "familyName required" });
    }

    const users = await User.find({ familyName });

    res.json(users || []);

  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// ❌ DELETE USER
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
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
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 📊 MEMBER DETAILS (OPTIMIZED 🚀)
const getMemberDetails = async (req, res) => {
  try {
    const { familyName } = req.query;

    if (!familyName) {
      return res.status(400).json({ error: "familyName required" });
    }

    const users = await User.find({ familyName });

    // fetch all transactions once (performance fix 🔥)
    const txns = await Transaction.find();

    const result = users.map(user => {
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

        if (t.type === "transfer" &&
          (t.fromUser === user.name || t.toUser === user.name)
        ) {
          transfer += t.amount;
        }
      });

      return {
        ...user.toObject(),
        income,
        expense,
        transfer
      };
    });

    res.json(result);

  } catch (err) {
    console.error("MEMBER DETAILS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 📜 MEMBER TRANSACTIONS
const getMemberTransactions = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ error: "Name required" });
    }

    const txns = await Transaction.find({
      $or: [
        { fromUser: name },
        { toUser: name }
      ]
    }).sort({ createdAt: -1 });

    res.json(txns || []);

  } catch (err) {
    console.error("MEMBER TXN ERROR:", err);
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