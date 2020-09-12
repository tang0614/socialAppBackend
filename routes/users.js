const express = require("express");
const router = express("Router");
const Joi = require("joi");
const User = require("../model/usersdb");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
//image
const multer = require("multer");

// '/upload becomes absolute path

const schema = Joi.object({
  handle: Joi.string().alphanum().min(5).max(30).required(),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),

  repeat_password: Joi.ref("password"),

  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error({ message: "image type should be png/jpeg" }), false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

//get other users detail
router.get("/:handle", async (req, res) => {
  const user = await User.find({ handle: req.params.handle }).select(
    "-password"
  );
  res.send(user);
});

//get personal detail
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

//add user details
router.put("/details", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params._id, {
    $set: {
      website: req.body.website,
      location: req.body.location,
      bio: req.body.bio,
    },
  });

  if (!user)
    return res.status(404).send("The user with the given ID was not provides");

  // return scream
  res.send(user);
});

//add user image
router.put("/image", auth, upload.single("profileImage"), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      imageUrl: req.file.path,
    },
  });

  if (!user)
    return res.status(404).send("The user with the given ID was not provides");

  // return scream
  res.send(user);
});

//add friend
router.put("/:handle", auth, async (req, res) => {
  //check if the documents exists, using find will return back an array of objects
  const target = await User.findOne({ handle: req.params.handle });

  if (!target) {
    //must return otherwise the following code will be executes
    return res.status(404).send("the user of the given id is not found");
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      following: [target._id],
    },
  });

  if (!user)
    return res.status(404).send("The user with the given ID was not provides");

  // return scream
  res.send(user);
});

//authorization
router.post("/", async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(404).send(error.details[0].message);
  }
  //if the user already registered
  let user = await User.findOne({ handle: req.body.handle });
  if (user) return res.status(400).send({ message: "user already registered" });

  let user2 = await User.findOne({ email: req.body.email });
  if (user2)
    return res.status(400).send({ message: "user already registered" });

  if (req.body.password !== req.body.repeat_password)
    return res.status(400).send({ message: "password is different" });

  user = new User({
    handle: req.body.handle,
    email: req.body.email,
    password: req.body.password,
  });

  const salt = await bcrypt.genSalt(5);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  const token = user.generatedAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-header", "x-auth-token")
    .send(_.pick(user, ["_id", "handle", "email"]));
});

module.exports = router;
