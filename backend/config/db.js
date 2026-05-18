//require("dotenv").config();
const mysql = require("mysql2/promise");

// ================= MYSQL CONNECTION =================
const pool = mysql.createPool({
  host: "localhost",
  user: "root",          // your MySQL username
  password: "1234",          // your MySQL password
  database: "restaurant_db",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ================= TEST DATABASE CONNECTION =================
(async () => {

  try {

    const connection = await pool.getConnection();

    console.log("✅ MySQL Connected Successfully");

    connection.release();

  } catch (error) {

    console.error("❌ MySQL Connection Error:", error.message);
  }

})();

// ================= EXPORT =================
module.exports = pool;