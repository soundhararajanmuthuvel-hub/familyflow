const router = require("express").Router();
const ctrl = require("../controllers/transactionController");

// 💰 ADD MONEY
router.post("/add", ctrl.addMoney);

// 💸 EXPENSE
router.post("/expense", ctrl.addExpense);

// 🔁 TRANSFER / LOAN
router.post("/send", ctrl.sendMoney);

// 💳 PAY LOAN
router.post("/pay-loan/:id", ctrl.payLoan);

// 📜 GET ALL
router.get("/", ctrl.getAllTransactions);

// 📊 STATS
router.get("/stats", ctrl.getStats);

// 📈 MONTHLY
router.get("/monthly", ctrl.getMonthlyReport);

module.exports = router;