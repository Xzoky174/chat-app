const mongoose = require("mongoose");
require("dotenv").config({
  path: "../.env.local",
});

const MONGODB_URI = process.env.AUTH_MONGODB_URI;

const connect = async () => {
  const usersConn = await mongoose.createConnection(MONGODB_URI).asPromise();
  const messagesConn = usersConn.useDb("messages");

  return { usersConn, messagesConn };
};

module.exports = connect;
