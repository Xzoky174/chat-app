const express = require("express");

const connect = require("./mongoose/connect");

const getUserModel = require("./mongoose/schemas/User.schema");
const getMessageModel = require("./mongoose/schemas/Message.schema");
const getPendingFriendsModel = require("./mongoose/schemas/PendingFriends.schema");

const global = require("./shared/global");

const authRouter = require("./routes/auth.route");
const friendsRouter = require("./routes/friends.route");

const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8000",
  },
});

const setHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
  );
};

app.use(express.json());
app.use(require("cookie-parser")());

app.use((_, res, next) => {
  setHeaders(res);
  next();
});
app.options("/", (_, res) => {
  setHeaders(res);
  return res.status(204).end();
});

const PORT = process.env.PORT || 3000;

connect()
  .then(({ usersConn, messagesConn }) => {
    global.User = getUserModel(usersConn);
    global.PendingFriend = getPendingFriendsModel(usersConn);
    global.Message = getMessageModel(messagesConn);

    app.use("/auth", authRouter);
    app.use("/user/friends", friendsRouter);

    global.IO = io;
    require("./routes/messages.route");

    server.listen(PORT, () => {
      console.log("WS Server Connected");
    });
  })
  .catch((reason) => {
    console.error(reason);
  });
