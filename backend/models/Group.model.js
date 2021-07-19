const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Group = new Schema({
  _id: Schema.Types.ObjectId,
  memberList: {
    type: Array,
    default: [],
  },
  groupName: {
    type: String,
    required: true,
  },
  usernameCreateGroup: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Group", Group);
