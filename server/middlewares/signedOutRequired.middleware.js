const getUserFromToken = require("../shared/getUserFromToken");

const signedOutRequired = async (req, res, next) => {
  const { token } = req.cookies;

  if ((await getUserFromToken(token)) !== null) {
    return res.status(403).send("Log out to access this function");
  }
  next();
};

module.exports = signedOutRequired;
