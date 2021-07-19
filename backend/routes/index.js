var express = require("express");
var app = express();
const userController = require("../controllers/User.controller");
// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  res.send("hello world");
});

app.get("/list-chat", function (req, res) {
  console.log("/list-chat");
});

app.post("/login", userController.login);

app.post("/create-user", userController.createUser);
module.exports = app;
