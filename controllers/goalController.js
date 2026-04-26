const Goal = require("../models/goal"); // Changed to lowercase
const User = require("../models/user");

// 🎯 CREATE GOAL
const createGoal = async (req, res) => {
  try {
    const { userName, title, targetAmount } = req.body;
    if (!userName || !title || !targetAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const goal = await Goal.create({
      userName,
      title,
      targetAmount,
      savedAmount: 0
    });
    res.json(goal);
  } catch (err) {
    console.error("❌ createGoal Error:", err);
    res.status(500).json({ error: "Failed to create goal" });
  }
};

// ➕ ADD MONEY TO GOAL
const addToGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const user = await User.findOne({ name: goal.userName });
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: "Not enough balance" });
    }

    user.balance -= amount;
    goal.savedAmount += amount;

    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = "completed";
      goal.savedAmount = goal.targetAmount;
    }

    await user.save();
    await goal.save();

    res.json({
      saved: goal.savedAmount,
      remaining: goal.targetAmount - goal.savedAmount,
      status: goal.status
    });
  } catch (err) {
    console.error("❌ addToGoal Error:", err);
    res.status(500).json({ error: "Process failed" });
  }
};

// 📜 GET USER GOALS
const getGoals = async (req, res) => {
  try {
    const { userName } = req.query;
    const goals = await Goal.find(userName ? { userName } : {}).lean();
    res.json(goals || []);
  } catch (err) {
    console.error("❌ getGoals Error:", err);
    res.status(500).json([]);
  }
};


module.exports = {
  createGoal,
  addToGoal,
  getGoals
};