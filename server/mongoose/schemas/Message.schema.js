const mongoose = require("mongoose");

const getMessageModel = (messagesConn) => {
  const messageSchema = new mongoose.Schema(
    {
      content: {
        type: String,
        required: true,
      },
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    { timestamps: true }
  );

  return messagesConn.model("Message", messageSchema);
};

module.exports = getMessageModel;
