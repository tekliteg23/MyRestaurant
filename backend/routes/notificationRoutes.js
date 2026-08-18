const express = require("express");

const router = express.Router();

const db = require("../config/db");


const {
verifyToken
}
=
require("../middleware/authMiddleware");



// ================= GET USER NOTIFICATIONS =================

router.get(
"/",

verifyToken,

async(req,res)=>{


try{

const [rows] =
await db.query(

`
SELECT *

FROM notifications

WHERE user_id = ?

ORDER BY id DESC

`,

[req.user.id]

);


res.json(rows);


}

catch(error){

console.error(error);

res.status(500).json({

message:"Server error"

});

}


}

);


// ================= DELETE NOTIFICATION =================

router.delete(

"/:id",

verifyToken,

async(req,res)=>{


try{


const notificationId =
req.params.id;



const userId =
req.user.id;



// delete only user's own notification

const [result] =
await db.query(

`
DELETE FROM notifications

WHERE id = ?

AND user_id = ?

`,

[
notificationId,
userId
]

);



if(result.affectedRows === 0){


return res.status(404).json({

message:
"Notification not found"

});


}



res.json({

success:true,

message:
"Notification removed"

});


}

catch(error){

console.error(
"Delete Notification Error:",
error
);


res.status(500).json({

message:
"Server error"

});


}


}

);



module.exports = router;