const db = require("../config/db");

// ================= 📦 GET ALL ORDERS (ADMIN) =================
exports.getOrders = async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT 
        o.id,
        o.user_id,

        u.name AS customer_name,
        u.email,

        o.total,
        o.status,
        o.order_date,

        m.name AS item_name,
        m.image,

        oi.quantity,
        oi.price

      FROM orders o

      JOIN users u
        ON o.user_id = u.id

      JOIN order_items oi
        ON o.id = oi.order_id

      JOIN menu m
        ON oi.menu_id = m.id

      ORDER BY o.id DESC
    `);

    res.status(200).json(rows);

  } catch (error) {

    console.error(
      "Get Orders Error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ================= 🛒 CREATE ORDER =================
exports.createOrder = async (req, res) => {

  try {

    // ================= CHECK AUTH =================
    if (!req.user || !req.user.id) {

      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const userId = req.user.id;

    // ================= REQUEST DATA =================
    // ✅ REMOVED customer_name
    const { items } = req.body;

    // ================= VALIDATION =================
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {

      return res.status(400).json({
        message: "Missing order items"
      });
    }

    let total = 0;

    // ================= CALCULATE TOTAL =================
    for (const item of items) {

      // VALIDATE QUANTITY
      if (
        !item.quantity ||
        item.quantity <= 0
      ) {

        return res.status(400).json({
          message: "Invalid quantity"
        });
      }

      const [menuRows] = await db.query(
        `
        SELECT *
        FROM menu
        WHERE id = ?
        `,
        [item.menu_id]
      );

      // ❌ MENU NOT FOUND
      if (menuRows.length === 0) {

        return res.status(404).json({
          message: `Menu item ID ${item.menu_id} not found`
        });
      }

      const menuItem = menuRows[0];

      const itemPrice =
        parseFloat(menuItem.price);

      total +=
        itemPrice * item.quantity;
    }

    // ================= CREATE ORDER =================
    // ✅ FIXED QUERY
    const [orderResult] = await db.query(
      `
      INSERT INTO orders
      (
        user_id,
        total,
        payment_status,
        status,
        order_date
      )
      VALUES (?, ?, ?,?,NOW())
      `,
      [
       userId,
        total,
        "unpaid",
        "pending"
      ]
    );

    const orderId =
      orderResult.insertId;

    // ================= SAVE ORDER ITEMS =================
    for (const item of items) {

      const [menuRows] = await db.query(
        `
        SELECT price
        FROM menu
        WHERE id = ?
        `,
        [item.menu_id]
      );

      const itemPrice =
        parseFloat(menuRows[0].price);

      await db.query(
        `
        INSERT INTO order_items
        (
          order_id,
          menu_id,
          quantity,
          price
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          orderId,
          item.menu_id,
          item.quantity,
          itemPrice
        ]
      );
    }

    // ================= SUCCESS =================
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order_id: orderId,
      total
    });

  } catch (error) {

    console.error(
      "Create Order Error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ================= 👤 GET MY ORDERS =================
exports.getMyOrders = async (req, res) => {

  try {

    if (!req.user || !req.user.id) {

      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const userId = req.user.id;

    const [rows] = await db.query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.payment_status,
        o.order_date,

        m.name AS item_name,
        m.image,

        oi.quantity,
        oi.price

      FROM orders o

      JOIN order_items oi
        ON o.id = oi.order_id

      JOIN menu m
        ON oi.menu_id = m.id

      WHERE o.user_id = ?

      ORDER BY o.id DESC
    `, [userId]);

    res.status(200).json(rows);

  } catch (error) {

    console.error(
      "Get My Orders Error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ================= 🔄 UPDATE ORDER STATUS =================

exports.updateOrderStatus = async (req, res) => {

  try {

// ================= SECURITY CHECK =================


if(
!req.user ||
req.user.role !== "admin"
){

return res.status(403).json({

message:
"Admin access only"

});

}
// ================= GET DATA =================

    const { id } = req.params;

    const { status } = req.body;


       const allowedStatus = [

      "pending",

      "awaiting_payment",

      "paid",

      "completed",

      "delivered",

      "cancelled"

    ];

    if (
      !status ||
      !allowedStatus.includes(status)

    ) {

      return res.status(400).json({

        message:"Invalid status"

      });

    }

    // ================= UPDATE ORDER =================


    const [result] = await db.query(

`
UPDATE orders

SET

status = ?,


payment_status =

CASE


WHEN ? = 'paid'

THEN 'paid'



WHEN ? = 'completed'

THEN 'paid'



WHEN ? = 'delivered'

THEN 'paid'



ELSE payment_status


END


WHERE id = ?

`,

[

status,

status,

status,

status,

id

]

);
    if(result.affectedRows === 0){


      return res.status(404).json({

        message:"Order not found"

      });


    }

   // =================================================
    // 🔔 CREATE USER NOTIFICATION
    // =================================================


    if(status === "awaiting_payment"){



      const [orderData] = await db.query(

`
SELECT

user_id

FROM orders

WHERE id = ?

`,

[id]

);
      if(orderData.length > 0){



        await db.query(

`
INSERT INTO notifications

(

user_id,

order_id,

message

)
VALUES

(?,?,?)

`,

[
orderData[0].user_id,

id,

`Your order #${id} is ready for payment. Please complete your payment.`

]

);

      }

   }

    // =================================================
    // 🔔 PAYMENT COMPLETED NOTIFICATION
    // =================================================


    if(status === "paid"){



      const [orderData] = await db.query(

`
SELECT

user_id

FROM orders

WHERE id = ?

`,

[id]

);

      if(orderData.length > 0){



        await db.query(

`
INSERT INTO notifications

(

user_id,

order_id,

message

)
VALUES

(?,?,?)

`,

[
orderData[0].user_id,

id,


`Payment received for order #${id}. Your order is being processed.`

]
);
      }

    }

    res.json({

      success:true,

      message:

      "Order status updated successfully"
    });

  }
  catch(error){


    console.error(

      "Update Order Status Error:",

      error

    );
    res.status(500).json({

      message:"Server error"

    });
   }
};

// ================= 👤 CUSTOMER CONFIRM ORDER =================
exports.confirmOrder = async (req, res) => {

  try {

    if (!req.user || !req.user.id) {

      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT *
      FROM orders
      WHERE id = ?
      AND user_id = ?
      `,
      [id, userId]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        message: "Order not found"
      });
    }

    const order = rows[0];

    if (order.status !== "completed") {

      return res.status(400).json({
        message:
          "Order not completed yet"
      });
    }

    await db.query(
      `
      UPDATE orders
      SET status = 'delivered'
      WHERE id = ?
      `,
      [id]
    );

    res.json({
      success: true,
      message:
        "Order confirmed successfully"
    });

  } catch (error) {

    console.error(
      "Confirm Order Error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ================= 🗑 DELETE ORDER =================
exports.deleteOrder = async (req, res) => {

  try {

    const { id } = req.params;

    await db.query(
      `
      DELETE FROM order_items
      WHERE order_id = ?
      `,
      [id]
    );

    const [result] = await db.query(
      `
      DELETE FROM orders
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {

      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {

    console.error(
      "Delete Order Error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ================= 🗑 CUSTOMER DELETE PENDING ORDER =================

exports.deleteMyOrder = async (req,res)=>{

  try{

    // CHECK LOGIN

    if(!req.user || !req.user.id){

      return res.status(401).json({
        message:"Unauthorized"
      });

    }


    const userId = req.user.id;

    const { id } = req.params;



    // CHECK ORDER OWNER + STATUS

    const [orders] = await db.query(

      `
      SELECT *
      FROM orders
      WHERE id = ?
      AND user_id = ?
      `,

      [
        id,
        userId
      ]

    );



    if(orders.length === 0){

      return res.status(404).json({

        message:"Order not found"

      });

    }



    const order = orders[0];



    // ONLY PENDING CAN DELETE

    if(order.status !== "pending"){


      return res.status(400).json({

        message:
        "Only pending orders can be deleted"

      });


    }



    // DELETE ITEMS FIRST

    await db.query(

      `
      DELETE FROM order_items
      WHERE order_id = ?
      `,

      [id]

    );



    // DELETE ORDER

    await db.query(

      `
      DELETE FROM orders
      WHERE id = ?
      `,

      [id]

    );



    res.json({

      success:true,

      message:
      "Pending order deleted successfully"

    });
 }
  catch(error){


    console.error(
      "Delete My Order Error:",
      error
    );


    res.status(500).json({

      message:"Server error"

    });
 }
};

// ======================================

// GET SINGLE ORDER
// ======================================

exports.getSingleOrder = async (req, res) => {

try{

const userId = req.user.id;

const { id } = req.params;

const [rows] = await db.query(

`
SELECT

o.id,
o.total,
o.status,
o.order_date,

m.name,
m.price,
m.image,

oi.quantity

FROM orders o

JOIN order_items oi
ON o.id=oi.order_id

JOIN menu m
ON oi.menu_id=m.id

WHERE

o.id=?
AND
o.user_id=?

`,

[
id,
userId
]

);

if(rows.length===0){

return res.status(404).json({

message:"Order not found"

});

}

res.json(rows);

}

catch(error){

console.error(error);

res.status(500).json({

message:"Server error"

});

}

};