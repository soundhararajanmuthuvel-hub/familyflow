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

// POST /api/transactions
exports.addTransaction = async (req, res) => {
  try {
    const { amount, familyName, description, type } = req.body;

    if (!amount || !familyName) {
      return res.status(400).json({ error: "Amount and Family Name are required" });
    }

    const transaction = new Transaction({
      amount: Number(amount),
      familyName,
      description,
      type: type || "expense",
      createdAt: new Date() // Ensure createdAt exists
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error("❌ addTransaction Error:", err);
    res.status(500).json({ error: "Failed to save transaction" });
  }
};