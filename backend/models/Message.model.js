const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Message = new Schema({
  _id: Schema.Types.ObjectId,
  fromUser: {
    type: String,
    required: true,
  },
  toUser: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: {},
  },
  date: {
    type: String,
    required: true,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("Message", Message);
