const db = require("../config/db");

// ================= GET ALL INGREDIENTS =================
exports.getAllIngredients = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM ingredients ORDER BY id DESC"
    );

    res.status(200).json(rows);

  } catch (err) {
    console.error("GET INGREDIENTS ERROR:", err);
    res.status(500).json({ message: "Error fetching ingredients" });
  }
};


// ================= ADD INGREDIENT =================
exports.addIngredient = async (req, res) => {
  try {
    let { name, quantity, unit, unit_price } = req.body;

    // 🔒 CLEAN INPUT
    name = name?.trim();
    unit = unit?.trim();

    quantity = Number(quantity);
    unit_price = Number(unit_price);

    // 🔒 VALIDATION
    if (!name || !unit || isNaN(quantity) || isNaN(unit_price)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (quantity <= 0 || unit_price <= 0) {
      return res.status(400).json({ message: "Quantity and price must be greater than 0" });
    }

    const total_value = quantity * unit_price;

    await db.query(
      `INSERT INTO ingredients (name, quantity, unit, unit_price, total_value)
       VALUES (?, ?, ?, ?, ?)`,
      [name, quantity, unit, unit_price, total_value]
    );

    res.status(201).json({
      message: "Ingredient added successfully"
    });

  } catch (err) {
    console.error("ADD INGREDIENT ERROR:", err);
    res.status(500).json({ message: "Error adding ingredient" });
  }
};


// ================= UPDATE INGREDIENT =================
exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, quantity, unit, unit_price } = req.body;

    name = name?.trim();
    unit = unit?.trim();

    quantity = Number(quantity);
    unit_price = Number(unit_price);

    if (!name || !unit || isNaN(quantity) || isNaN(unit_price)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (quantity <= 0 || unit_price <= 0) {
      return res.status(400).json({ message: "Quantity and price must be greater than 0" });
    }

    const [check] = await db.query(
      "SELECT id FROM ingredients WHERE id = ?",
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    const total_value = quantity * unit_price;

    await db.query(
      `UPDATE ingredients 
       SET name=?, quantity=?, unit=?, unit_price=?, total_value=?
       WHERE id=?`,
      [name, quantity, unit, unit_price, total_value, id]
    );

    res.status(200).json({
      message: "Ingredient updated successfully"
    });

  } catch (err) {
    console.error("UPDATE INGREDIENT ERROR:", err);
    res.status(500).json({ message: "Error updating ingredient" });
  }
};


// ================= DELETE INGREDIENT =================
exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    const [check] = await db.query(
      "SELECT id FROM ingredients WHERE id = ?",
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    await db.query(
      "DELETE FROM ingredients WHERE id = ?",
      [id]
    );

    res.status(200).json({
      message: "Ingredient deleted successfully"
    });

  } catch (err) {
    console.error("DELETE INGREDIENT ERROR:", err);
    res.status(500).json({ message: "Error deleting ingredient" });
  }
};