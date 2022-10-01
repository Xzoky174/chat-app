const global = require("../shared/global");
const jwt = require("jsonwebtoken");

const getUserFromId = require("./getUserFromId");

const getUserFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, global.JWT_SECRET);
    return getUserFromId(decoded.id);
  } catch {
    return null;
  }
};

module.exports = getUserFromToken;
