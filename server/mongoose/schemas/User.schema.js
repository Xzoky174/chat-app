const mongoose = require("mongoose");

const getUserModel = (usersConn) => {
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    friends: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  });

  return usersConn.model("User", userSchema);
};

module.exports = getUserModel;
