const mongoose = require("mongoose");
const NotificationSchema = require("../models/Notification.model");
mongoose.set("useFindAndModify", false);
exports.saveNotification = function saveNotification(notification) {
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
  let result = notificationList.map(notification =>
    notification.isGroup ? notification.groupName : notification.fromUser
  );
  console.log(result, "result fetch");
  result = result.filter(function (elem, index, self) {
    return index === self.indexOf(elem) && elem;
  });
  return result;
};

exports.turnOffNotification = async function turnOffNotification(notification) {
  let notificationList = await NotificationSchema.updateMany(
    {
      $or: [
        { fromUser: notification.fromUser, toUser: notification.toUser },
        { groupName: notification.fromUser, toUser: notification.toUser },
      ],
    },
    { isReaded: true },
    {
      new: true,
    }
  );

  return notificationList;
};
