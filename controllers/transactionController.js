const User = require("../models/user");
const Transaction = require("../models/transaction");


// 💰 ADD MONEY
const addMoney = async (req, res) => {
  try {
    const { name, amount, note } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount required" });
    }

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance = (user.balance || 0) + Number(amount);
    await user.save();

    await Transaction.create({
      toUser: name,
      amount: Number(amount),
      type: "income",
      note: note || "",
      createdAt: new Date()
    });

    res.json({ message: "Money added" });

  } catch (err) {
    console.error("ADD MONEY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 💸 EXPENSE
const addExpense = async (req, res) => {
  try {
    const { name, amount, note } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount required" });
    }

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance -= Number(amount);
    await user.save();

    await Transaction.create({
      fromUser: name,
      amount: Number(amount),
      type: "expense",
      note: note || "",
      createdAt: new Date()
    });

    res.json({ message: "Expense added" });

  } catch (err) {
    console.error("EXPENSE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 🔁 TRANSFER / LOAN
const sendMoney = async (req, res) => {
  try {
    const { fromUser, toUser, amount, type, note } = req.body;

    if (!fromUser || !toUser || !amount || !type) {
      return res.status(400).json({ error: "All fields required" });
    }

    const sender = await User.findOne({ name: fromUser });
    const receiver = await User.findOne({ name: toUser });

    if (!sender || !receiver) {
      return res.status(400).json({ error: "User not found" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    sender.balance -= Number(amount);
    receiver.balance += Number(amount);

    await sender.save();
    await receiver.save();

    await Transaction.create({
      fromUser,
      toUser,
      amount: Number(amount),
      type,
      note: note || "",
      paidAmount: 0,
      status: type === "loan" ? "pending" : "done",
      createdAt: new Date()
    });

    res.json({ message: "Success" });

  } catch (err) {
    console.error("TRANSFER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 💳 PAY LOAN
const payLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const loan = await Transaction.findById(id);
    if (!loan) return res.status(404).json({ error: "Loan not found" });

    const payer = await User.findOne({ name: loan.toUser });
    const receiver = await User.findOne({ name: loan.fromUser });

    if (!payer || !receiver) {
      return res.status(400).json({ error: "User not found" });
    }

    if (payer.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    payer.balance -= Number(amount);
    receiver.balance += Number(amount);

    await payer.save();
    await receiver.save();

    loan.paidAmount = (loan.paidAmount || 0) + Number(amount);

    if (loan.paidAmount >= loan.amount) {
      loan.status = "paid";
      loan.paidAmount = loan.amount;
    } else {
      loan.status = "partial";
    }

    await loan.save();

    res.json({
      message: "Payment done",
      remaining: loan.amount - loan.paidAmount,
      status: loan.status
    });

  } catch (err) {
    console.error("PAY LOAN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 🏦 ADD TO SAVINGS
const addToSavings = async (req, res) => {
  try {
    const { name, amount } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount required" });
    }

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({ error: "Not enough balance" });
    }

    user.balance -= Number(amount);
    user.savings = (user.savings || 0) + Number(amount);

    await user.save();

    await Transaction.create({
      fromUser: name,
      amount: Number(amount),
      type: "savings",
      note: "Added to savings",
      createdAt: new Date()
    });

    res.json({ message: "Moved to savings" });

  } catch (err) {
    console.error("SAVINGS ADD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 💸 WITHDRAW SAVINGS
const withdrawSavings = async (req, res) => {
  try {
    const { name, amount } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount required" });
    }

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.savings < amount) {
      return res.status(400).json({ error: "Not enough savings" });
    }

    user.savings -= Number(amount);
    user.balance += Number(amount);

    await user.save();

    await Transaction.create({
      toUser: name,
      amount: Number(amount),
      type: "withdraw",
      note: "Withdraw from savings",
      createdAt: new Date()
    });

    res.json({ message: "Withdrawn from savings" });

  } catch (err) {
    console.error("SAVINGS WITHDRAW ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 📜 GET ALL TRANSACTIONS
const getAllTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find().sort({ createdAt: -1 });
    res.json(txns || []);

  } catch (err) {
    console.error("GET TXN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 📊 STATS
const getStats = async (req, res) => {
  try {
    const { familyName } = req.query;

    const users = await User.find({ familyName });
    const txns = await Transaction.find();

    const totalBalance = users.reduce(
      (sum, u) => sum + (u.balance || 0),
      0
    );

    res.json({
      members: users.length,
      totalBalance,
      transactions: txns.length
    });

  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 📈 MONTHLY REPORT (FIXED)
const getMonthlyReport = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(data || []);

  } catch (err) {
    console.error("MONTHLY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  addMoney,
  addExpense,
  sendMoney,
  payLoan,
  addToSavings,
  withdrawSavings,
  getAllTransactions,
  getStats,
  getMonthlyReport
};