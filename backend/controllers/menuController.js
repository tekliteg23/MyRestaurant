const db = require("../config/db");

// ================= ALLOWED CATEGORIES =================
const allowedCategories = ["foods", "cool drinks", "hot drinks"];

// ================= ➕ ADD MENU =================
exports.addMenuItem = async (req, res) => {
  try {
    let { name, category, price } = req.body;

    name = name?.trim();
    category = category?.trim();
    price = parseFloat(price);

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !category || isNaN(price)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const [result] = await db.query(
      "INSERT INTO menu (name, category, price, image) VALUES (?, ?, ?, ?)",
      [name, category, price, image]
    );

    res.status(201).json({
      message: "Menu item added successfully",
      id: result.insertId
    });

  } catch (err) {
    console.error("Add Menu Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// ================= 📋 GET MENU =================
exports.getMenu = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM menu ORDER BY id DESC"
    );

    res.status(200).json(rows);

  } catch (err) {
    console.error("Get Menu Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// ================= ✏️ UPDATE MENU =================
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, category, price } = req.body;

    name = name?.trim();
    category = category?.trim();
    price = parseFloat(price);

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !category || isNaN(price)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    let sql = "";
    let params = [];

    if (image) {
      sql = "UPDATE menu SET name=?, category=?, price=?, image=? WHERE id=?";
      params = [name, category, price, image, id];
    } else {
      sql = "UPDATE menu SET name=?, category=?, price=? WHERE id=?";
      params = [name, category, price, id];
    }

    const [result] = await db.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({
      message: "Menu updated successfully"
    });

  } catch (err) {
    console.error("Update Menu Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// ================= 🗑 DELETE MENU =================
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM menu WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({
      message: "Menu deleted successfully"
    });

  } catch (err) {
    console.error("Delete Menu Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};