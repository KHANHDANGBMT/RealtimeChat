const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Notification = new Schema({
  _id: Schema.Types.ObjectId,
  fromUser: {
    type: String,
    default: [],
  },
  toUser: {
    type: String,
    required: true,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  notificationNumber: {
    type: Number,
    default: 1,
  },
  groupName: {
    type: String,
    default: "",
  },
  isReaded: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("Notification", Notification);
