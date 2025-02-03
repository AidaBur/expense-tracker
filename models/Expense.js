const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "Please provide an amount for the expense"],
  },
  category: {
    type: String,
    required: [true, "Please provide a category for the expense"],
    enum: ["Food", "Transport", "Entertainment", "Utilities", "Other"], 
  },
  description: {
    type: String,
    maxlength: 500,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  goal: {
    type: mongoose.Types.ObjectId,
    ref: "Goal", 
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User", 
    required: [true, "Please provide user reference"],
  },
}, { timestamps: true });

module.exports = mongoose.model("Expense", ExpenseSchema);
