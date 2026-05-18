const db = require("../config/db");

// ================= 📊 SUMMARY =================
exports.getSummary = async (req, res) => {
  try {
    // ✅ Revenue
    const [revenueRows] = await db.query(`
      SELECT IFNULL(SUM(total), 0) AS revenue FROM orders
    `);

    // ✅ Expenses
    const [expenseRows] = await db.query(`
      SELECT IFNULL(SUM(amount), 0) AS expenses FROM expenses
    `);

    // ✅ Ingredients (STOCK VALUE)
    const [ingredientRows] = await db.query(`
      SELECT IFNULL(SUM(total_value), 0) AS ingredients
      FROM ingredients
    `);

    const revenue = revenueRows[0].revenue;
    const expenses = expenseRows[0].expenses;
    const ingredients = ingredientRows[0].ingredients;

    const profit = revenue - expenses - ingredients;

    res.json({
      revenue,
      expenses,
      ingredients,
      profit
    });

  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ message: "Error loading summary" });
  }
};


// ================= 📅 MONTHLY PROFIT (FIXED) =================
exports.getMonthlyProfit = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        month,
        SUM(revenue) AS revenue,
        SUM(expenses) AS expenses,
        MAX(ingredients) AS ingredients
      FROM (

        -- 🟢 ORDERS (Revenue)
        SELECT 
          DATE_FORMAT(o.order_date, '%Y-%m') AS month,
          o.total AS revenue,
          0 AS expenses,
          0 AS ingredients
        FROM orders o

        UNION ALL

        -- 🔴 EXPENSES
        SELECT 
          DATE_FORMAT(e.expense_date, '%Y-%m') AS month,
          0 AS revenue,
          e.amount AS expenses,
          0 AS ingredients
        FROM expenses e

        UNION ALL

        -- 🟡 INGREDIENTS (TOTAL STOCK VALUE - GLOBAL)
        SELECT 
          DATE_FORMAT(NOW(), '%Y-%m') AS month,
          0 AS revenue,
          0 AS expenses,
          SUM(i.total_value) AS ingredients
        FROM ingredients i

      ) AS combined

      GROUP BY month
      ORDER BY month ASC
    `);

    const result = rows.map(row => ({
      month: row.month,
      revenue: Number(row.revenue),
      expenses: Number(row.expenses),
      ingredients: Number(row.ingredients),
      profit: Number(row.revenue) - Number(row.expenses) - Number(row.ingredients)
    }));

    res.json(result);

  } catch (err) {
    console.error("MONTHLY PROFIT ERROR:", err);
    res.status(500).json({ message: "Chart error" });
  }
};