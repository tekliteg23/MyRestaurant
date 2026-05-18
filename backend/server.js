require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Parse Form Data
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================

// Upload folder
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// Frontend public folder
const publicPath = path.join(
  __dirname,
  "../public"
);

app.use(express.static(publicPath));

// ================= HOME PAGE =================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(publicPath, "index.html")
  );

});

// ================= API ROUTES =================

// 🔐 AUTH ROUTES
const authRoutes =
  require("./routes/authRoutes");

app.use(
  "/api/auth",
  authRoutes
);

// 🍔 MENU ROUTES
const menuRoutes =
  require("./routes/menuRoutes");

app.use(
  "/api/menu",
  menuRoutes
);

// 📦 ORDER ROUTES
const orderRoutes =
  require("./routes/orderRoutes");

app.use(
  "/api/orders",
  orderRoutes
);

// 💳 PAYMENT ROUTES
const paymentRoutes =
  require("./routes/paymentRoutes");

app.use(
  "/api/payment",
  paymentRoutes
);

// 🥕 INGREDIENT ROUTES
const ingredientRoutes =
  require("./routes/ingredientRoutes");

app.use(
  "/api/ingredients",
  ingredientRoutes
);

// 💸 EXPENSE ROUTES
const expenseRoutes =
  require("./routes/expenseRoutes");

app.use(
  "/api/expenses",
  expenseRoutes
);

// 📊 DASHBOARD ROUTES
const dashboardRoutes =
  require("./routes/dashboardRoutes");

app.use(
  "/api/dashboard",
  dashboardRoutes
);

// ================= TEST PAYMENT ROUTE =================

app.get(
  "/payment-success",
  (req, res) => {

    res.sendFile(
      path.join(
        publicPath,
        "payment-success.html"
      )
    );

  }
);

// ================= 404 HANDLER =================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Route not found"
  });

});

// ================= GLOBAL ERROR HANDLER =================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Internal server error"
    });

  }
);

// ================= START SERVER =================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`
====================================
🚀 Server Running Successfully
🌍 http://localhost:${PORT}
====================================
💳 Payment Route:
http://localhost:${PORT}/api/payment

✅ Payment Success Page:
http://localhost:${PORT}/payment-success
====================================
  `);

});