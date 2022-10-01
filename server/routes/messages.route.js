const { IO, logger, Message, User } = require("../shared/global");

IO.on("connection", (socket) => {
  logger.info(`[${socket.id}] connected`);

  let id = undefined;

  socket.on("init", async (data) => {
    id = data.id;
    socket.join(id);

    socket.emit("load", {
      messages: await Message.find(
        { $or: [{ from: id }, { to: id }] },
        "content from to createdAt -_id"
      ).populate("from to", "username"),
    });
  });
  socket.on("disconnect", () => {
    logger.info(`[${socket.id}] disconnected`);
  });

  socket.on("message", async ({ content, to }) => {
    const message = new Message({
      content,
      from: id,
      to,
    });
    await message.save();

    logger.info(`[${socket.id}]: (${content}) -> [${to}]`);

    IO.sockets
      .in(to)
      .emit("message", { from: id, content, createdAt: message.createdAt });

    socket.emit("message-sent", { to, content, createdAt: message.createdAt });
  });
});
