const winston = require("winston");
require("dotenv").config({
  path: "../.env.local",
});

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.label(),
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [new winston.transports.File({ filename: "logfile.log" })],
});

const global = {
  User: undefined,
  PendingFriend: undefined,
  Message: undefined,
  IO: undefined,
  logger: logger,
  JWT_SECRET: process.env.JWT_SECRET,
};

module.exports = global;
