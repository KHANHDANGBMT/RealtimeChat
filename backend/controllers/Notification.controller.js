const mongoose = require("mongoose");
const NotificationSchema = require("../models/Notification.model");

exports.saveNotification = function saveNotification(notification) {
  // console.log(notification, "notification receive from server");
  const notificationInstance = new NotificationSchema({
    _id: mongoose.Types.ObjectId(),
    fromUser: notification.fromUser,
    toUser: notification.toUser,
    isGroup: notification.isGroup,
    notificationNumber: notification.notificationNumber,
    groupName: notification.groupName,
  });
  return notificationInstance
    .save()
    .then(newNotification => {
      return newNotification;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
};

exports.fetchNotificationList = async function fetchNotificationList(username) {
  let notificationList = await NotificationSchema.find({
    toUser: username,
    isReaded: false,
  });
  console.log(notificationList, "notification list");
  return notificationList;
};

exports.turnOffNotification = async function turnOffNotification(notification) {
  let notificationList = await NotificationSchema.findOneAndUpdate(
    {
      isReaded: false,
      fromUser: notification.fromUser,
      toUser: notification.toUser,
    },
    { isReaded: true },
    {
      new: true,
    }
  );

  return notificationList;
};
