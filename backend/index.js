require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const BodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const port = 5000;
const indexRouter = require("./routes");
const app = express();
const server = require("http").createServer(app);
let io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
var _findIndex = require("lodash/findIndex");
const user = require("./controllers/User.controller");
const message = require("./controllers/Message.controller");
const group = require("./controllers/Group.controller");
const notification = require("./controllers/Notification.controller");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch(err => {
    console.log(err);
  });

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use(cors());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
// view engine setup
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// setup router
app.use("/", indexRouter);

// socket
io.on("connection", async function (socket) {
  //  save socket when user login
  await user.saveSocketId(socket.handshake.query.username, socket.id);

  let listGroup = await group.fetchGroupList(socket.handshake.query.username);
  await listGroup.forEach(group => {
    socket.join(group.groupName);
  });

  socket.on("disconnect", function () {
    user.removeSocketId(socket.id);
  });

  socket.on("userList", async data => {
    let listUser = await user.listUser();
    io.sockets.emit("userList", { userList: listUser });
  });

  socket.on("groupList", async data => {
    let listGroup = await group.fetchGroupList(data?.username);
    io.to(socket.id).emit("groupList", listGroup);
  });

  socket.on("getMessage", async data => {
    console.log(data, "get Message");
    let mySocket = await user.userListSocket(data.fromUser);
    let listMessage = await message.getMessage(data.fromUser, data.toUser);
    if (mySocket) {
      mySocket.forEach(socketId => {
        io.to(socketId).emit("fetchMessageList", listMessage);
      });
    }
  });

  socket.on("sendMessage", async messageSend => {
    let isSavedMessage = await message.saveMessage(messageSend);
    let socketReceiver = await user.userListSocket(messageSend?.toUser);
    let socketSender = await user.userListSocket(messageSend?.fromUser);
    let listMessage = await message.getMessage(
      messageSend?.fromUser,
      messageSend?.toUser
    );
    await notification.saveNotification({
      fromUser: messageSend.fromUser,
      toUser: messageSend.toUser,
      isGroup: false,
      notificationNumber: 1,
      groupName: "",
    });
    if (isSavedMessage && socketReceiver && socketSender) {
      socketReceiver.forEach(socketId => {
        io.to(socketId).emit("fetchMessageList", listMessage);
      });
      socketSender.forEach(socketId => {
        io.to(socketId).emit("fetchMessageList", listMessage);
      });
    }
  });

  socket.on("createGroup", async groupData => {
    let dataNewGroup = {
      ...groupData,
      memberList: [groupData?.usernameCreateGroup],
    };
    let groupSave = await group.saveGroup(dataNewGroup);
    let socketSender = await user.userListSocket(groupSave.usernameCreateGroup);
    if (socketSender.length && groupSave) {
      socket.join(groupSave?.groupName);
      socketSender.forEach(socketId => {
        io.to(socketId).emit("createGroup", groupSave);
      });
    }
  });

  socket.on("joinGroup", async data => {
    let addUser = await group.addUser(data.usernameJoin, data.groupId);
    let listGroup = await group.fetchGroupList(data.usernameJoin);
    if (addUser) {
      socket.join(addUser.groupName);
      let socketList = await user.userListSocket(data.usernameJoin);
      if (socketList.length) {
        socketList.forEach(socketId => {
          io.to(socketId).emit("groupList", listGroup);
        });
      }
    }
  });

  socket.on("sendMessageGroup", async data => {
    await message.saveMessage({
      fromUser: data.userSend,
      toUser: data.groupName,
      message: data.message,
      date: data.date,
      toUserId: data._id,
      isGroup: true,
    });
    await data.memberList.forEach(async username => {
      if (username !== data.userSend) {
        let notificationSave = await notification.saveNotification({
          fromUser: data.userSend,
          toUser: username,
          isGroup: true,
          notificationNumber: 1,
          groupName: data.groupName,
        });
        if (notificationSave) {
          let notificationList = await notification.fetchNotificationList(
            username
          );
          let socketList = await user.userListSocket(username);
          await socketList.forEach(socketId => {
            io.to(socketId).emit("fetchNotificationList", {
              userSend: data.fromUser,
              notificationList,
            });
          });
        }
      }
    });

    io.to(data.groupName).emit("sendMessageGroup", data);
  });

  socket.on("getMessageGroup", async data => {
    let listMessageGroup = await message.getMessageGroup(data);
    io.to(socket.id).emit("getMessageGroup", { listMessageGroup, data: data });
  });

  socket.on("createNotification", async data => {
    let notificationList = await notification.fetchNotificationList(
      data.toUser
    );

    io.to(data.groupName).emit("fetchNotificationList", {
      userSend: data.fromUser,
      notificationList,
    });
  });

  socket.on("createNotificationUser", async data => {
    let notificationSave = await notification.saveNotification({
      fromUser: data.fromUser,
      toUser: data.toUser,
      isGroup: data.isGroup,
      notificationNumber: 1,
      groupName: data.groupName,
    });
    let notificationList = await notification.fetchNotificationList(
      data.toUser
    );

    let socketSender = await user.userListSocket(data.toUser);
    if (socketSender.length && notificationSave) {
      socketSender.forEach(socketId => {
        io.to(socketId).emit("fetchNotificationList", {
          userSend: data.fromUser,
          notificationList,
        });
      });
    }
  });

  socket.on("fetchNotificationList", async data => {
    let notificationList = await notification.fetchNotificationList(
      data.username
    );

    io.to(socket.id).emit("fetchNotificationList", {
      notificationList,
    });
  });

  socket.on("turnOffNotification", async data => {
    let result = await notification.turnOffNotification({
      fromUser: data.turnOffUser,
      toUser: data.userTurnOff,
    });

    let notificationList = await notification.fetchNotificationList(
      data.userTurnOff
    );

    let socketSender = await user.userListSocket(data.userTurnOff);
    if (socketSender.length) {
      socketSender.forEach(socketId => {
        io.to(socketId).emit("fetchNotificationList", {
          notificationList,
        });
      });
    }
  });
});

server.listen(port, function () {
  console.log("Server listening connect: http://localhost:" + port);
});

module.exports = app;
