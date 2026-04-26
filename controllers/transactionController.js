const User = require("../models/User");
const Transaction = require("../models/transaction");


// 💰 ADD MONEY
const addMoney = async (req, res) => {
  try {
    const { name, amount, note } = req.body;

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance = (user.balance || 0) + amount;
    await user.save();

    await Transaction.create({
      toUser: name,
      amount,
      type: "income",
      note: note || ""
    });

    res.json({ message: "Money added" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 💸 EXPENSE
const addExpense = async (req, res) => {
  try {
    const { name, amount, note } = req.body;

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance -= amount;
    await user.save();

    await Transaction.create({
      fromUser: name,
      amount,
      type: "expense",
      note: note || ""
    });

    res.json({ message: "Expense added" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔁 TRANSFER / LOAN
const sendMoney = async (req, res) => {
  try {
    const { fromUser, toUser, amount, type, note } = req.body;

    const sender = await User.findOne({ name: fromUser });
    const receiver = await User.findOne({ name: toUser });

    if (!sender || !receiver) {
      return res.status(400).json({ error: "User not found" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    await Transaction.create({
      fromUser,
      toUser,
      amount,
      type, // transfer or loan
      note: note || "",
      paidAmount: 0,
      status: type === "loan" ? "pending" : "done"
    });

    res.json({ message: "Success" });

  } catch (err) {
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

    payer.balance -= amount;
    receiver.balance += amount;

    await payer.save();
    await receiver.save();

    loan.paidAmount = (loan.paidAmount || 0) + amount;

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
    res.status(500).json({ error: err.message });
  }
};


// 🏦 ADD TO SAVINGS
const addToSavings = async (req, res) => {
  try {
    const { name, amount } = req.body;

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({ error: "Not enough balance" });
    }

    user.balance -= amount;
    user.savings = (user.savings || 0) + amount;

    await user.save();

    res.json({ message: "Moved to savings" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 💸 WITHDRAW FROM SAVINGS
const withdrawSavings = async (req, res) => {
  try {
    const { name, amount } = req.body;

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.savings < amount) {
      return res.status(400).json({ error: "Not enough savings" });
    }

    user.savings -= amount;
    user.balance += amount;

    await user.save();

    res.json({ message: "Withdrawn from savings" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📜 GET ALL TRANSACTIONS
const getAllTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find().sort({ createdAt: -1 });
    res.json(txns);

  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
};


// 📈 MONTHLY REPORT
const getMonthlyReport = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ EXPORT
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