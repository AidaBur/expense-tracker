// controllers/expenses.js

const Expense = require("../models/Expense");

const getAllExpenses = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new Error("User information is missing.");
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const categoryFilter = req.query.category || '';
        const descriptionFilter = req.query.description || '';
        const amountFilter = req.query.amount || '';

        const expenses = await Expense.find({
            user: req.user.id,
            category: { $regex: categoryFilter, $options: 'i' },
            description: { $regex: descriptionFilter, $options: 'i' },
            amount: { $gte: amountFilter }
        })
            .sort('date')
            .skip(skip)
            .limit(limit);

        const totalExpenses = await Expense.countDocuments({
            user: req.user.id,
            category: { $regex: categoryFilter, $options: 'i' },
            description: { $regex: descriptionFilter, $options: 'i' },
            amount: { $gte: amountFilter }
        });

        const totalPages = Math.ceil(totalExpenses / limit);

        res.render("expenses", {
            expenses,
            currentPage: page,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            limit,
            categoryFilter,
            descriptionFilter,
            amountFilter
        });
    } catch (error) {
        next(error);
    }
};

const showExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
        if (!expense) {
            req.flash("error", "Expense not found.");
            return res.redirect("/expenses");
        }
        res.render("showExpense", { expense, _csrf: res.locals._csrf });
    } catch (error) {
        next(error);
    }
};

const showExpenseForm = async (req, res, next) => {
    try {
        if (req.params.id) {
            const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
            if (!expense) {
                req.flash("error", "Expense not found.");
                return res.redirect("/expenses");
            }
            return res.render("expense", { expense, _csrf: res.locals._csrf });
        }
        // Render form for a new expense
        res.render("expense", { expense: null, _csrf: res.locals._csrf });
    } catch (error) {
        req.flash("error", "An unexpected error occurred.");
        return next(error);
    }
};

const createExpense = async (req, res, next) => {
    try {
        const { amount, category, description, goal } = req.body;
        await Expense.create({
            amount,
            category,
            description,
            goal,
            user: req.user.id,
        });
        res.redirect("/expenses");
    } catch (error) {
        next(error);
    }
};

const updateExpense = async (req, res, next) => {
    try {
        const { amount, category, description, goal } = req.body;
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { amount, category, description, goal },
            { new: true, runValidators: true }
        );
        if (!expense) {
            req.flash("error", "Expense not found.");
            return res.redirect("/expenses");
        }
        res.redirect("/expenses");
    } catch (error) {
        next(error);
    }
};

const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!expense) {
            req.flash("error", "Expense not found.");
        }

        // Preserve filters and pagination in redirect URL
        const { page, limit, category, description, amount } = req.query;

        const redirectUrl = `/expenses?page=${encodeURIComponent(page || 1)}&limit=${encodeURIComponent(limit || 10)}&category=${encodeURIComponent(category || '')}&description=${encodeURIComponent(description || '')}&amount=${encodeURIComponent(amount || '')}`;

        res.redirect(redirectUrl);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllExpenses,
    showExpense,
    showExpenseForm,
    createExpense,
    updateExpense,
    deleteExpense,
};
