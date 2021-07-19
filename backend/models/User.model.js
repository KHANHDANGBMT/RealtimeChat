const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");

const UserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  unreadMessage: {
    type: Array,
    default: {},
  },
  listSocketId: {
    type: Array,
    default: [],
  },
  salt: String,
});

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString("hex");
};

UserSchema.methods.validPassword = function (password) {
  let passwordHash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString("hex");
  return this.password === passwordHash;
};

module.exports = mongoose.model("User", UserSchema);
