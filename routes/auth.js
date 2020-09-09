const express = require("express");
const router = express("Router");
const Joi = require("joi");
const User = require("../model/usersdb");
const _ = require("lodash");
const bcrypt = require("bcrypt");

const schema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

router.post("/", async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(404).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });

  if (!user)
    return res.status(400).send({ message: "Invalid email or password" });

  //validate password, comparing salted and unsalted password
  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword)
    return res.status(400).send({ message: "Invalid email or password" });

  //_id is the information of the user , here is mongodb id, and so we do not need to query the data anymore
  //privateKey is the digital signature that only  on the the server
  const token = user.generatedAuthToken();
  res.header("x-auth-token", token).status(200).send({ token });
});
module.exports = router;
