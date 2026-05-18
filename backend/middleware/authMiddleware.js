const jwt = require("jsonwebtoken");

// ================= CONFIG =================
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// ================= VERIFY TOKEN =================
exports.verifyToken = (req, res, next) => {
  try {
    // Get Authorization Header
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided"
      });
    }

    // Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Check token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Save user data to request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();

  } catch (err) {
    console.error("JWT ERROR:", err.message);

    return res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// ================= ADMIN ONLY =================
exports.isAdmin = (req, res, next) => {

  // Check user exists
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access"
    });
  }

  // Check admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only"
    });
  }

  next();
};