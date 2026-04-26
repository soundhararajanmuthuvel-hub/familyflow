const Goal = require("../models/Goal");
const User = require("../models/user");


// 🎯 CREATE GOAL
const createGoal = async (req, res) => {
  const { userName, title, targetAmount } = req.body;

  const goal = await Goal.create({
    userName,
    title,
    targetAmount
  });

  res.json(goal);
};


// ➕ ADD MONEY TO GOAL
const addToGoal = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const goal = await Goal.findById(id);
  const user = await User.findOne({ name: goal.userName });

  if (user.balance < amount) {
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
};


// 📜 GET USER GOALS
const getGoals = async (req, res) => {
  const { userName } = req.query;

  const goals = await Goal.find({ userName });

  res.json(goals);
};


module.exports = {
  createGoal,
  addToGoal,
  getGoals
};