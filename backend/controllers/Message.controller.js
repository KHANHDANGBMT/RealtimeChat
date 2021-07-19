const mongoose = require("mongoose");
const MessageSchema = require("../models/Message.model");

exports.saveMessage = function saveMessage(message) {
  const messageInstance = new MessageSchema({
    _id: mongoose.Types.ObjectId(),
    fromUser: message.fromUser,
    toUser: message.toUser,
    message: message.message,
    date: message.date,
    toUserId: message.toUserId,
    isGroup: message.isGroup,
  });
  return messageInstance
    .save()
    .then(newMessage => {
      return newMessage;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
};

exports.fetchMessageList = async function fetchMessageList(username) {
  let listMessage = await MessageSchema.find({
    $or: [{ fromUser: username }, { toUser: username }],
  }).sort({ date: 1 });
  return listMessage;
};

exports.getMessage = async function getMessage(fromUser, toUser) {
  let listMessage = await MessageSchema.find({
    $or: [
      { fromUser: fromUser, toUser: toUser },
      { fromUser: toUser, toUser: fromUser },
    ],
  }).sort({ date: 1 });

  return listMessage;
};

exports.getMessageGroup = async function getMessageGroup(data) {
  let listMessage = await MessageSchema.find({
    isGroup: true,
    toUser: data.groupName,
  });
  return listMessage;
};
