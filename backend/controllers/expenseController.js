const db = require("../config/db");

// ================= ➕ ADD EXPENSE =================
exports.addExpense = async (req, res) => {
  try {
    let { category, amount, expense_date } = req.body;

    category = category?.trim();
    amount = parseFloat(amount);

    if (!category || !expense_date || isNaN(amount)) {
      return res.status(400).json({
        message: "All fields are required and amount must be a number"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0"
      });
    }

    await db.query(
      "INSERT INTO expenses (category, amount, expense_date) VALUES (?, ?, ?)",
      [category, amount, expense_date]
    );

    res.status(201).json({
      message: "Expense added successfully"
    });

  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= 📋 GET ALL EXPENSES =================
exports.getExpenses = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM expenses ORDER BY id DESC"
    );

    res.json(rows);

  } catch (error) {
    console.error("Get Expenses Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ✏️ UPDATE EXPENSE =================
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    let { category, amount, expense_date } = req.body;

    category = category?.trim();
    amount = parseFloat(amount);

    if (!category || !expense_date || isNaN(amount)) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0"
      });
    }

    const [result] = await db.query(
      "UPDATE expenses SET category=?, amount=?, expense_date=? WHERE id=?",
      [category, amount, expense_date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({
      message: "Expense updated successfully"
    });

  } catch (error) {
    console.error("Update Expense Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= 🗑 DELETE EXPENSE =================
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM expenses WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};