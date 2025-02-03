const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title for the goal"],
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
    maxlength: 500,
  },
  targetAmount: {
    type: Number,
    required: [true, "Please provide the target amount for the goal"],
  },
  currentAmount: {
    type: Number,
    default: 0, 
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User", 
    required: [true, "Please provide user reference"],
  },
  deadline: {
    type: Date,
    required: [true, "Please provide the deadline date"],
  },
}, { timestamps: true });

module.exports = mongoose.model("Goal", GoalSchema);
