const credsRequired = (req, res, next) => {
  const { username, password } = req.body;

  if (username === undefined || password === undefined) {
    return res.status(400).send("Invalid Data");
  }
  next();
};

module.exports = credsRequired;
