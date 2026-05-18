const bcrypt = require("bcrypt");

const password = "123@456"; // 👉 change this

bcrypt.hash(password, 10).then(hash => {
  console.log("Your hash:");
  console.log(hash);
});