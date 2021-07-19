const mongoose = require("mongoose");
const UserSchema = require("../models/User.model");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

exports.createUser = function createUser(req, res) {
  const user = new UserSchema({
    _id: mongoose.Types.ObjectId(),
    username: req.body.username,
    password: req.body.password,
    listChat: {},
    listSocketId: [],
    salt: "",
  });
  user.setPassword(req.body.password);
  return user
    .save()
    .then(newUser => {
      const token = jwt.sign(
        { username: newUser.username, _id: newUser._id },
        process.env.JWT_KEY,
        { expiresIn: "1d" }
      );
      return res.status(201).json({
        success: true,
        message: "Create user successfully",
        user: newUser,
        token,
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Server create user error",
        error: error.message,
      });
    });
};

exports.login = function login(req, res) {
  UserSchema.findOne({ username: req.body.username }, function (err, user) {
    if (user === null) {
      return res.status(403).send({
        message: "User not found.",
      });
    } else {
      if (user.validPassword(req.body.password)) {
        const token = jwt.sign(
          { username: user.username, _id: user._id },
          process.env.JWT_KEY,
          { expiresIn: "1d" }
        );
        return res.status(201).send({
          message: "User Logged In.",
          token,
        });
      } else {
        return res.status(403).send({
          message: "Wrong Password!",
        });
      }
    }
  });
};

exports.listUser = function listUser() {
  return UserSchema.find().then(res => {
    return res;
  });
};

exports.saveSocketId = async function saveSocketId(username, socketId) {
  if (username && socketId) {
    let listSocket = await UserSchema.find();
    listSocket.forEach((user, index) => {
      if (listSocket[index].username === username) {
        listSocket[index].listSocketId?.push(socketId);
        listSocket[index].save();
      }
    });
  } else {
    return false;
  }
};

exports.removeSocketId = async function removeSocketId(socketId) {
  // let listSocket = await UserSchema.find();
  await UserSchema.updateMany(
    {},
    {
      $pull: {
        listSocketId: { $in: [socketId] },
      },
    },
    { multi: true }
  );
  // listSocket.forEach(async (user, index) => {
  //   if (user.listSocketId.indexOf(socketId) > -1) {
  //     listSocket[index].listSocketId = user.listSocketId.splice(
  //       user.listSocketId.indexOf(socketId),
  //       1
  //     );
  //     await listSocket[index].update({}, {});
  //   }
  // });
  // console.log(listSocket, "list socket rm id");
};

exports.userListSocket = async function userListSocket(username) {
  let listSocket = await UserSchema.find({ username: username });
  return listSocket.length ? listSocket[0].listSocketId : false;
};

exports.addUnreadMessage = async function addUnreadMessage(username) {
  let unreadMessage = UserSchema.find({ un });
};
