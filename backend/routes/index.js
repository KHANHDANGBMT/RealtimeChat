var express = require("express");
var app = express();
const userController = require("../controllers/User.controller");

app.get("/", function (req, res) {
  res.send("hello world");
});

app.post("/login", userController.login);

app.post("/create-user", userController.createUser);
module.exports = app;
