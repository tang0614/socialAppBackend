const express = require("express");
const router = express("Router");
const Joi = require("joi");
const User = require("../model/usersdb");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

const schema = Joi.object({
  handle: Joi.string().alphanum().min(5).max(30).required(),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),

  repeat_password: Joi.ref("password"),

  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),

  // access_token: [
  //     Joi.string(),
  //     Joi.number()
  // ],
});
//authorization -whether user has token
router.get("/me", auth, async (req, res) => {
  const user = await (await User.findById(req.user._id)).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(404).send(error.details[0].message);
  }
  //if the user already registered
  let user = await User.findOne({ handle: req.body.handle });

  if (user) return res.status(400).send({ message: "user already registered" });

  if (req.body.password !== req.body.repeat_password)
    return res.status(400).send({ message: "password is different" });

  user = new User({
    handle: req.body.handle,
    email: req.body.email,
    password: req.body.password,
  });

  const salt = await bcrypt.genSalt(20);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  const token = user.generatedAuthToken();

  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "handle", "email"]));
});
module.exports = router;
