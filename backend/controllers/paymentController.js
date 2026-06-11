const axios = require("axios");
const https = require("https");
const db = require("../config/db");

// ================= CHAPA CONFIG =================

const CHAPA_URL =
  "https://api.chapa.co/v1/transaction/initialize";

const CHAPA_SECRET_KEY =
  process.env.CHAPA_SECRET_KEY;

// ✅ CHECK KEY
console.log(
  "CHAPA KEY:",
  CHAPA_SECRET_KEY ? "Loaded" : "Missing"
);

// ================= INITIALIZE PAYMENT =================

exports.initializePayment = async (req, res) => {

  try {

    console.log(
      "PAYMENT BODY:",
      req.body
    );

    const {
      amount,
      email,
      first_name,
      last_name,
      items,
      user_id
    } = req.body;

    // ================= VALIDATION =================

    if (
      !amount ||
      !email ||
      !first_name ||
      !items ||
      items.length === 0
    ) {

      return res.status(400).json({
        message: "Missing payment data"
      });
    }

    // ================= GENERATE TX REF =================

    const tx_ref =
      "tx-" + Date.now();

    // ================= CREATE ORDER =================

    const [orderResult] = await db.query(
  `
  INSERT INTO orders
  (
    user_id,
    total,
    payment_status,
    tx_ref,
    status,
    order_date
  )
  VALUES (?, ?, ?, ?, ?, NOW())
  `,
  [
    user_id,
    amount,
    "unpaid",
    tx_ref,
    "awaiting_payment"
  ]
);

    const orderId =
      orderResult.insertId;

    console.log(
      "ORDER CREATED:",
      orderId
    );

    // ================= SAVE ORDER ITEMS =================

    for (const item of items) {
const [menuRows] = await db.query(

`
SELECT price
FROM menu
WHERE id=?

`,

[item.menu_id]

);



if(menuRows.length===0){

continue;

}


      await db.query(
        `
        INSERT INTO order_items
        (
          order_id,
          menu_id,
          quantity,
          price
        )
        VALUES (?, ?, ?,?)
        `,
        [
          orderId,
          item.menu_id,
          item.quantity,
          menuRows[0].price
        ]
      );
    }

    console.log(
      "ORDER ITEMS SAVED"
    );

    // ================= CHAPA REQUEST =================

    const chapaResponse = await axios.post(
      CHAPA_URL,
      {
        amount,
        currency: "ETB",

        email,

        first_name,

        last_name:
          last_name || "Customer",

        tx_ref,

        callback_url:
           `https://restaurant-backend-umgr.onrender.com/api/payment/verify/${tx_ref}`,

       return_url:
                   "https://restaurant-backend-umgr.onrender.com/payment-success"
      },
      {
        headers: {

          Authorization:
            `Bearer ${CHAPA_SECRET_KEY}`,

          "Content-Type":
            "application/json"
        },

        // ✅ FIX SSL CERTIFICATE ERROR
        httpsAgent:
          new https.Agent({
            rejectUnauthorized: false
          })
      }
    );

    console.log(
      "CHAPA RESPONSE:",
      chapaResponse.data
    );

    // ================= SUCCESS =================

    return res.status(200).json({
      checkout_url:
        chapaResponse.data.data.checkout_url
    });

  } catch (error) {

    console.error(
      "CHAPA ERROR FULL:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message:
        error.response?.data?.message ||
        error.message ||
        "Payment initialization failed"
    });
  }
};

// ================= VERIFY PAYMENT =================

exports.verifyPayment = async (req, res) => {

  try {

    const tx_ref =
      req.params.tx_ref;

    console.log(
      "VERIFY TX:",
      tx_ref
    );

    // ================= VERIFY PAYMENT =================

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {

          Authorization:
            `Bearer ${CHAPA_SECRET_KEY}`

        },

        // ✅ FIX SSL CERTIFICATE ERROR
        httpsAgent:
          new https.Agent({
            rejectUnauthorized: false
          })
      }
    );

    console.log(
      "VERIFY RESPONSE:",
      response.data
    );

    const payment =
      response.data.data;

    // ================= PAYMENT SUCCESS =================

    if (
      payment.status === "success"
    ) {

      await db.query(
  `
  UPDATE orders
  SET
    payment_status = 'paid',
    status = 'paid'
  WHERE tx_ref = ?
  `,
  [tx_ref]
    );

      console.log(
        "PAYMENT UPDATED TO PAID"
      );
    }

    // ================= REDIRECT =================

     return res.redirect(

               "https://restaurant-backend-umgr.onrender.com/payment-success"
        );

  } catch (error) {

    console.error(
      "VERIFY ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message:
        error.response?.data?.message ||
        "Verification failed"
    });
  }
};