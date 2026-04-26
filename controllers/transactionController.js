const Transaction = require("../models/transaction");

// GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions || []);
  } catch (err) {
    console.error("❌ getTransactions Error:", err);
    res.status(500).json([]);
  }
};

// GET /api/transactions/stats
exports.getTransactionStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$familyName",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats || []);
  } catch (err) {
    console.error("❌ getTransactionStats Error:", err);
    res.status(500).json([]);
  }
};

// GET /api/transactions/monthly
exports.getMonthlyTransactions = async (req, res) => {
  try {
    const monthlyData = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $exists: true, $ne: null } 
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);
    res.json(monthlyData || []);
  } catch (err) {
    console.error("❌ getMonthlyTransactions Error:", err);
    res.status(500).json([]);
  }
};

// Helper to handle multiple transaction types from frontend
exports.addTransaction = async (req, res) => {
  try {
    const { amount, familyName, note, type, name, fromUser, toUser } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const transaction = new Transaction({
      amount: Number(amount),
      familyName: familyName || "Default",
      note: note || "",
      type: type || "expense",
      fromUser: fromUser || name || "System",
      toUser: toUser || "System",
      createdAt: new Date()
    });

    await transaction.save();
    
    // Update user balance (simple logic)
    if (type === "income" || type === "add") {
      await require("../models/user").findOneAndUpdate(
        { name: name || toUser },
        { $inc: { balance: Number(amount) } }
      );
    } else if (type === "expense") {
      await require("../models/user").findOneAndUpdate(
        { name: name || fromUser },
        { $inc: { balance: -Number(amount) } }
      );
    }

    res.status(201).json(transaction);
  } catch (err) {
    console.error("❌ addTransaction Error:", err);
    res.status(500).json({ error: "Failed to save transaction" });
  }
};

// Aliases for the specific routes used in dashboard.html
exports.addIncome = exports.addTransaction;
exports.addExpense = exports.addTransaction;
exports.sendMoney = exports.addTransaction;
exports.addSavings = async (req, res) => {
  try {
    const { name, amount } = req.body;
    await require("../models/user").findOneAndUpdate({ name }, { $inc: { savings: amount, balance: -amount } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
};