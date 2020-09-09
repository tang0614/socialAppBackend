const express = require("express");
const router = express("Router");
const Joi = require("joi");
const Scream = require("../model/screamsdb");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const schema = Joi.object({
  body: Joi.string().min(3).max(30).required(),

  //     .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
});

router.get("/", async (req, res) => {
  const screams = await Scream.find();

  res.send(screams);
});

router.post("/", auth, async (req, res) => {
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

  await scream.save();

  // return scream
  res.send(scream);
});

router.put("/:_id", auth, async (req, res) => {
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

router.delete("/:_id", [auth, admin], async (req, res) => {
  try {
    const scream = await Scream.findByIdAndRemove(req.params._id);
    if (!scream) {
      //must return otherwise the following code will be executes
      return res.status(404).send("the scream of the given id is not found");
      // return scream
      res.send(scream);
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
