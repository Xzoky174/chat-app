const express = require("express");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const credsRequired = require("../middlewares/credsRequired.middleware");
const signedInRequired = require("../middlewares/signedInRequired.middleware");
const signedOutRequired = require("../middlewares/signedOutRequired.middleware");

const getUserFromToken = require("../shared/getUserFromToken");
const global = require("../shared/global");

const router = express.Router();

const setCookieWithId = (res, id) => {
  const token = jwt.sign({ id }, global.JWT_SECRET);

  res.cookie("token", token, {
    domain: "localhost",
    path: "/",
    httpOnly: false,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    secure: true,
    sameSite: "Lax",
  });
};

router.post("/signup", signedOutRequired, credsRequired, async (req, res) => {
  const { username, password } = req.body;

  if (username === undefined || password === undefined) {
    return res.status(400).send("Invalid Data");
  }

  if (username.length < 4)
    return res.status(409).send("Username must be more than 3 characters");
  else if (username.length > 20)
    return res.status(409).send("Username must not be more than 20 characters");
  else if (password.length < 8)
    return res.status(409).send("Password must be more than 7 characters");
  else if ((await global.User.findOne({ username })) !== null)
    return res.status(409).send("Username is Taken");

  const hashed = await bcrypt.hash(password, 15);

  const user = global.User({
    username,
    password: hashed,
  });
  user.save();

  setCookieWithId(res, user.id);

  return res.status(201).send("Successful!");
});

router.post("/signin", signedOutRequired, credsRequired, async (req, res) => {
  const { username, password } = req.body;

  if (username.length < 4 || password.length < 8)
    return res.status(400).send("User not Found");

  const user = await global.User.findOne({ username });
  if (user === null) return res.status(400).send("User not Found");

  if (await bcrypt.compare(password, user.password)) {
    setCookieWithId(res, user.id);

    return res.status(200).send("Successful!");
  }

  return res.status(401).send("Incorrect Password");
});

router.post("/signout", signedInRequired, (_, res) => {
  res.cookie("token", "", { maxAge: 0 });
  return res.status(200).send("Successful!");
});

router.get("/user/:token", signedInRequired, async (_, res) => {
  const { user } = res.locals;
  if (user === null) return res.status(404).send("Not Found");

  res.status(200).json({ user: { username: user.username, _id: user._id } });
});

module.exports = router;
