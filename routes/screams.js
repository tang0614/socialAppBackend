const express = require("express");
const router = express("Router");
const Joi = require("joi");
const Scream = require("../model/screamsdb");

router.get("/", async (req, res) => {
  const screams = await Scream.find();

  res.send(screams);
});

router.post("/", async (req, res) => {
  // check if body is valid
  // if not valid, return 400
  const validateResult = schema.validate(req.body);
  if (validateResult.error) {
    res.status(404).send(validateResult.error.details[0].message);
  }

  const scream = new Scream({
    body: req.body.body,
    commentCount: 0,
    likeCount: 0,
    userHandle: "user",
  });

  const result = await scream.save();

  // return scream
  res.send(scream);
});

router.put("/:_id", async (req, res) => {
  const scream = await Scream.findById(req.params._id);

  if (!scream) {
    //must return otherwise the following code will be executes
    return res.status(404).send("the scream of the given id is not found");
  }

  // check if body is valid
  // if not valid, return 400
  const validateResult = schema.validate(req.body);
  if (validateResult.error) {
    res.status(404).send(validateResult.error.details[0].message);
  }

  scream.set({
    body: req.body.body,
  });
  scream.save();

  // return scream
  res.send(scream);
});

router.delete("/:_id", async (req, res) => {
  const scream = await Scream.findById(req.params._id);

  if (!scream) {
    //must return otherwise the following code will be executes
    return res.status(404).send("the scream of the given id is not found");
  }
  await Scream.deleteOne({ _id: req.params._id });
  // return scream
  res.send(scream);
});

const schema = Joi.object({
  body: Joi.string().min(3).max(30).required(),

  // username: Joi.string()
  //     .alphanum()
  //     .min(3)
  //     .max(30)
  //     .required(),

  // password: Joi.string()
  //     .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

  // repeat_password: Joi.ref('password'),

  // access_token: [
  //     Joi.string(),
  //     Joi.number()
  // ],

  // birth_year: Joi.number()
  //     .integer()
  //     .min(1900)
  //     .max(2013),

  // email: Joi.string()
  //     .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
});
//   .with("username", "birth_year")
//   .xor("password", "access_token")
//   .with("password", "repeat_password");

// try {
//   const value = await schema.validateAsync({
//     username: "abc",
//     birth_year: 1994,
//   });
// } catch (err) {}

module.exports = router;
