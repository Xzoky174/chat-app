const express = require("express");
const jwt = require("jsonwebtoken");

const signedInRequired = require("../middlewares/signedInRequired.middleware");

const getUserFromId = require("../shared/getUserFromId");
const getUserFromToken = require("../shared/getUserFromToken");

const global = require("../shared/global");

const router = express.Router();

router.get("/all", signedInRequired, async (_, res) => {
  const user = await res.locals.user.populate("friends", "username");

  const friends = user.friends;
  const requests = await global.PendingFriend.find(
    { to: user._id },
    "from -_id"
  )
    .populate("from", "username")
    .all();
  const sent = await global.PendingFriend.find({ from: user._id }, "from -_id")
    .populate("to", "username")
    .all();

  return res.status(200).json({ friends, requests, sent });
});

router.get("/", signedInRequired, async (_, res) => {
  const user = await res.locals.user.populate("friends", "username");
  const friends = user.friends;

  return res.status(200).json({ friends });
});

router.post("/", signedInRequired, async (req, res) => {
  const { friend } = req.body;
  const { user } = res.locals;

  if (friend === null || friend === undefined)
    return res.status(400).send("Invalid Uid");

  const friendUser = await getUserFromId(friend);
  if (friendUser === null) return res.status(400).send("User not found");

  user.friends.push(friend);
  await user.save();

  friendUser.friends.push(user);
  await friendUser.save();

  await global.PendingFriend.findOneAndDelete({ from: friend, to: user._id });

  res.status(201).send("Successful!");
});

router.delete("/:id", signedInRequired, async (req, res) => {
  const { id } = req.params;
  const { user } = res.locals;

  if (id === null || id === undefined)
    return res.status(400).send("Invalid Uid");

  try {
    await global.User.findByIdAndUpdate(id, {
      $pullAll: {
        friends: [{ _id: user._id }],
      },
    });
  } catch {
    return res.status(404).send("User not found");
  }

  user.friends.pull({ _id: id });
  user.save();

  res.status(200).send("Successful!");
});

router.get("/requests", signedInRequired, async (req, res) => {
  const { token } = req.cookies;
  const user = await getUserFromToken(token);

  const requests = await global.PendingFriend.find({ to: user }, "from")
    .populate("from", "username")
    .all();

  res.status(200).json({ requests });
});

router.post("/requests", signedInRequired, async (req, res) => {
  const { token } = req.cookies;
  const { friend } = req.body;

  if (friend === null || friend === undefined)
    return res.status(400).send("Invalid Uid");

  const user = await getUserFromToken(token);

  if (user.friends.includes(friend))
    return res.status(403).send("You are already friends");

  if (user.id === friend)
    return res.status(403).send("You can't add yourself as a friend");

  const friendUser = await global.User.findById(friend);
  if (friendUser === null) return res.status(400).send("Invalid Uid");

  if (
    (await global.PendingFriend.findOne({ from: user, to: friendUser })) !==
    null
  )
    return res.status(403).send("You have already sent a friend request");

  const pendingFriend = new global.PendingFriend({
    from: user,
    to: friendUser,
  });
  pendingFriend.save();

  return res.status(201).send("Sent!");
});

router.delete("/requests/:id", signedInRequired, async (req, res) => {
  const { id } = req.params;
  const { user } = res.locals;

  if (id === null || id === undefined)
    return res.status(400).send("Invalid Uid");

  const friendUser = await getUserFromId(id);
  if (friendUser === null) return res.status(404).send("User not found");

  await global.PendingFriend.findOneAndDelete({ from: id, to: user._id });

  res.status(200).send("Successful");
});

module.exports = router;
