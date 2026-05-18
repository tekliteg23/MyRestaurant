require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./config/db");

(async () => {
  try {
    const name = "teklit";
    const email = "teklit@gmail.com";
    const password = "123$$456"; // change this
    const role = "admin";

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ❌ Check if already exists
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      console.log("❌ Admin already exists");
      process.exit();
    }

    // ✅ Insert admin
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    console.log("✅ Admin user created successfully!");
    process.exit();

  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
})();