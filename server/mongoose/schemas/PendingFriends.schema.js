const mongoose = require("mongoose");

const getPendingFriendsModel = (usersConn) => {
  const pendingFriendsSchema = new mongoose.Schema({
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  });

  return usersConn.model("pending-friends", pendingFriendsSchema);
};

module.exports = getPendingFriendsModel;
