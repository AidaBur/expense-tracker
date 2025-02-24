// routes/expenses.js

const express = require("express");
const router = express.Router();

const {
    getAllExpenses,  
    showExpense,     
    showExpenseForm, 
    createExpense,   
    updateExpense,   
    deleteExpense,   
} = require("../controllers/expenses");

// 
router.route("/")
    .get(getAllExpenses)  
    .post(createExpense);  

 
router.get("/form/:id?", showExpenseForm);


router.get("/:id", showExpense);


router.post("/update/:id", updateExpense);


router.post("/delete/:id", deleteExpense);

module.exports = router;
