const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// ================= REGISTER =================
exports.register = async (req, res) => {

  try {

    let {
      name,
      email,
      password
    } = req.body;

    // ================= TRIM INPUTS =================
    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    // ================= VALIDATION =================
    if (!name || !email || !password) {

      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!email.includes("@")) {

      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    if (password.length < 6) {

      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // ================= CHECK EXISTING USER =================
    const [existing] = await db.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (existing.length > 0) {

      return res.status(409).json({
        message: "Email already exists"
      });
    }

    // ================= HASH PASSWORD =================
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // ================= DEFAULT ROLE =================
    const role = "user";

    // ================= INSERT USER =================
    await db.query(
      `
      INSERT INTO users
      (name, email, password, role)
      VALUES (?, ?, ?, ?)
      `,
      [
        name,
        email,
        hashedPassword,
        role
      ]
    );

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {

  try {

    let {
      email,
      password
    } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    // ================= VALIDATION =================
    if (!email || !password) {

      return res.status(400).json({
        message: "Email and password required"
      });
    }

    // ================= FIND USER =================
    const [rows] = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (rows.length === 0) {

      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const user = rows[0];

    // ================= CHECK PASSWORD =================
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // ================= CREATE TOKEN =================
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
        issuer: "restaurant-app"
      }
    );

    // ================= SUCCESS RESPONSE =================
    res.json({

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }

    });

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {

  try {

    let {
      email,
      newPassword
    } = req.body;

    // ================= TRIM INPUTS =================
    email = email?.trim().toLowerCase();
    newPassword = newPassword?.trim();

    // ================= VALIDATION =================
    if (!email || !newPassword) {

      return res.status(400).json({
        message: "Email and new password are required"
      });
    }

    if (newPassword.length < 6) {

      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // ================= CHECK USER =================
    const [users] = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (users.length === 0) {

      return res.status(404).json({
        message: "Email not found"
      });
    }

    // ================= HASH PASSWORD =================
    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    // ================= UPDATE PASSWORD =================
    await db.query(
      `
      UPDATE users
      SET password = ?
      WHERE email = ?
      `,
      [
        hashedPassword,
        email
      ]
    );

    // ================= SUCCESS =================
    res.json({
      message: "✅ Password reset successful"
    });

  } catch (error) {

    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};