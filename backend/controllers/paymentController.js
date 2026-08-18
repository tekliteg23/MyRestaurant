const axios = require("axios");
const https = require("https");
const db = require("../config/db");

// ================= API BASE =================
// CHANGE ONLY THIS WHEN DEPLOYING
const API_BASE = "http://localhost:5000";

// ================= CHAPA CONFIG =================

const CHAPA_URL =
  "https://api.chapa.co/v1/transaction/initialize";

const CHAPA_SECRET_KEY =
  process.env.CHAPA_SECRET_KEY;

console.log(
  "CHAPA KEY:",
  CHAPA_SECRET_KEY ? "Loaded" : "Missing"
);

// =================================================
// INITIALIZE PAYMENT FOR EXISTING ORDER
// =================================================

exports.initializePayment = async (req, res) => {

  try {

    console.log("PAYMENT BODY:", req.body);

    const { order_id } = req.body;

    // ================= VALIDATION =================

    if (!order_id) {
      return res.status(400).json({
        message: "Order ID required"
      });
    }

    // ================= GET ORDER =================

    const [orders] = await db.query(
      `
      SELECT
        o.id,
        o.total,
        u.name,
        u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
      `,
      [order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const order = orders[0];

   // ================= CREATE TRANSACTION REF =================

    const tx_ref = "tx-" + Date.now();

    // ================= UPDATE ORDER =================

    await db.query(
      `
      UPDATE orders
      SET
        tx_ref = ?,
        payment_status = 'unpaid',
        status = 'awaiting_payment'
      WHERE id = ?
      `,
      [tx_ref, order_id]
    );

    console.log("TX REF SAVED:", tx_ref);

    // ================= CHAPA REQUEST =================

    const chapaResponse = await axios.post(
      CHAPA_URL,
      {
        amount: order.total,
        currency: "ETB",
        email: order.email,
        first_name: order.name,
        last_name: "Customer",
        tx_ref,

        callback_url: `${API_BASE}/api/payment/verify/${tx_ref}`,

        return_url: `${API_BASE}/payment-success`
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      }
    );

    console.log("CHAPA RESPONSE:", chapaResponse.data);

    return res.json({
      checkout_url: chapaResponse.data.data.checkout_url
    });

  } 
  catch (error) {
    console.error(
      "PAYMENT INITIALIZE ERROR:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Payment initialization failed"
    });
  }
};

// =================================================
// VERIFY PAYMENT
// =================================================

exports.verifyPayment = async (req, res) => {

  try {

    const tx_ref = req.params.tx_ref;

    console.log("VERIFY TX:", tx_ref);

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      }
    );

    const payment = response.data.data;

    console.log("VERIFY RESPONSE:", payment);

    // ================= SUCCESS =================

   if(payment.status === "success"){


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
"✅ PAYMENT SUCCESS - ORDER UPDATED TO PAID"
);


}
else{


console.log(
"❌ PAYMENT NOT SUCCESS:",
payment.status
);


}

    // ================= REDIRECT =================

    return res.redirect(
      `${API_BASE}/payment-success`
    );

  } catch (error) {

    console.error(
      "VERIFY ERROR:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Verification failed"
    });
  }
};