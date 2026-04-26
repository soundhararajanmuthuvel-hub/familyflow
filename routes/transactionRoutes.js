const router = require("express").Router();
const ctrl = require("../controllers/transactionController");

// 💰 ADD MONEY
router.post("/add", ctrl.addIncome);

// 💸 EXPENSE
router.post("/expense", ctrl.addExpense);

// 🔁 TRANSFER / LOAN
router.post("/send", ctrl.sendMoney);

// 💳 PAY LOAN
router.post("/pay-loan/:id", ctrl.addTransaction);

// 📜 GET ALL
router.get("/", ctrl.getTransactions);

// 📊 STATS
router.get("/stats", ctrl.getTransactionStats);

// 📈 MONTHLY
router.get("/monthly", ctrl.getMonthlyTransactions);

module.exports = router;