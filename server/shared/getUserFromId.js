const global = require("./global");

const getUserFromId = (id) => {
  return global.User.findById(id);
};

module.exports = getUserFromId;
