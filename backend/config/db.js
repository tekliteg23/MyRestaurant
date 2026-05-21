require("dotenv").config();

const mysql = require("mysql2/promise");

// ================= MYSQL CONNECTION =================

const pool = mysql.createPool({

  host: process.env.DB_HOST,

  port: process.env.DB_PORT,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME,

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0,

  connectTimeout: 10000

});

// ================= TEST CONNECTION =================

(async () => {

  try {

    const connection = await pool.getConnection();

    console.log(
      "✅ MySQL Connected Successfully"
    );

    connection.release();

  } catch (error) {

    console.error(
      "❌ MySQL Connection Error:",
      error.message
    );
  }

})();

// ================= EXPORT =================

module.exports = pool;