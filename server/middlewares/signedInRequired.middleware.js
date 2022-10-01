const getUserFromToken = require("../shared/getUserFromToken");

const signedInRequired = async (req, res, next) => {
  const { token } = req.cookies;

  const user = await getUserFromToken(token);
  if (user === null) {
    return res.status(401).send("Not Authorized");
  }

  res.locals.user = user;
  next();
};

module.exports = signedInRequired;
