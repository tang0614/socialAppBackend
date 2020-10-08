const express = require("express");
const router = express("Router");
const Joi = require("joi");
const User = require("../model/usersdb");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const config = require("config");
//image
const multer = require("multer");
const multerS3 = require("multer-s3");
const mongoose = require("mongoose");
const Scream = require("../model/screamsdb");
const aws = require("aws-sdk");

const s3 = new aws.S3({
  accessKeyId: config.get("accessKeyId"),
  secretAccessKey: config.get("secretAccessKey"),
  Bucket: "xinyu-twitter-app",
});

const storage = multerS3({
  s3: s3,
  bucket: "xinyu-twitter-app",
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, Date.now().toString() + file.originalname);
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

// '/upload becomes absolute path

const schema = Joi.object({
  handle: Joi.string().alphanum().min(5).max(30),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),

  repeat_password: Joi.ref("password"),

  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  website: Joi.string().min(5).max(50),
  location: Joi.string().min(5).max(30),
  bio: Joi.string().min(5).max(200),
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, new Date().toISOString() + file.originalname);
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5,
//   },
//   fileFilter: fileFilter,
// });

//get other users detail
router.get("/:_id", auth, async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params._id),
      },
    },
    {
      $lookup: {
        from: "users", //collection name not model variable name
        localField: "following",
        foreignField: "_id",
        as: "following_details",
      },
    },
    {
      $lookup: {
        from: "users", //collection name not model variable name
        localField: "followedBy",
        foreignField: "_id",
        as: "followedBy_details",
      },
    },
  ]);

  if (!user) return res.status(404).send({ message: "user does not exist" });
  res.send({ user: user[0] });
});

//add user details
router.put("/details", auth, async (req, res) => {
  //The default is to return the original, unaltered document.
  //If you want the new, updated document to be returned you have to pass an additional argument:{returnOriginal:false}
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(404).send({ message: error.details[0].message });
  }

  const user_1 = await User.findById(req.user._id);
  if (!user_1)
    return res
      .status(404)
      .send({ message: "The user with the given ID was not provides" });

  let website = user_1.website;
  let bio = user_1.bio;
  let location = user_1.location;

  if (req.body.website) {
    website = req.body.website;
  }
  if (req.body.bio) {
    bio = req.body.bio;
  }
  if (req.body.location) {
    location = req.body.location;
  }

  //user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        website,
        location,
        bio,
      },
    },
    { new: true }
  );

  // return scream
  res.send({ user });
});

//add user image
router.put("/image", auth, upload.single("profileImage"), async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        imageUrl: req.file.path,
      },
    },
    { new: true }
  );

  if (!user)
    return res.status(404).send("The user with the given ID was not provides");

  // return scream
  res.send({ user });
});

//add friend
router.put("/follow/:_targetId", auth, async (req, res) => {
  if (req.params._targetId === req.user._id)
    return res.status(404).send({ message: "cannot follow yourself" });

  const target = await User.update(
    { _id: req.params._targetId },
    {
      $push: {
        followedBy: {
          _id: req.user._id,
        },
      },
    },
    { new: true }
  );

  if (!target) {
    //must return otherwise the following code will be executes
    return res
      .status(404)
      .send({ message: "the user of the given id is not found" });
  }

  const user = await User.update(
    { _id: req.user._id },
    {
      $push: {
        following: {
          _id: req.params._targetId,
        },
      },
    },
    { new: true }
  );

  if (!user)
    return res
      .status(404)
      .send({ message: "The user with the given ID was not provides" });

  // return scream
  res.send({ message: "successfully followed" });
});

//unfollow a friend
router.put("/unfollow/:_targetId", auth, async (req, res) => {
  //check if the documents exists, using find will return back an array of objects
  if (req.params._targetId === req.user._id)
    return res.status(404).send({ message: "cannot unfollow yourself" });

  const target = await User.findById(req.params._targetId);
  target.followedBy.pull(req.user._id);
  target.save();

  if (!target) {
    //must return otherwise the following code will be executes
    return res
      .status(404)
      .send({ message: "the user of the given id is not found" });
  }

  const user = await User.findById(req.user._id);
  user.following.pull(req.params._targetId);
  user.save();

  if (!user)
    return res
      .status(404)
      .send({ message: "The user with the given ID was not provides" });

  // return scream
  res.send({ message: "successfully unfollowed" });
});
//like screams
router.put("/like/:_id", auth, async (req, res) => {
  const scream = await Scream.findById(req.params._id);

  if (!scream)
    return res.status(404).send("The scream with the given ID was not valid");

  const updated = await User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      $push: {
        like: {
          _id: scream._id,
          authorName: scream.authorName,
          createdAt: scream.createdAt,
          body: scream.body,
        },
      },
    },
    { new: true }
  );

  if (!updated)
    return res.status(404).send("The User with the given ID was not provides");

  // return updated Section
  res.send({ updated });
});

//unlike screams
router.put("/unlike/:_id", auth, async (req, res) => {
  const scream = await Scream.findById(req.params._id);

  if (!scream)
    return res.status(404).send("The scream with the given ID was not valid");

  const target = await User.findById(req.user._id);
  target.like.pull({ _id: req.params._id });
  target.save();

  if (!target)
    return res.status(404).send("The User with the given ID was not provides");

  // return updated Section
  res.send({ target });
});

//authorization
router.post("/", async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(404).send({ message: error.details[0].message });
  }
  //if the user already registered
  let user = await User.findOne({ handle: req.body.handle });
  if (user)
    return res.status(400).send({ message: "userName already registered" });

  let user2 = await User.findOne({ email: req.body.email });
  if (user2)
    return res.status(400).send({ message: "email already registered" });

  if (req.body.password !== req.body.repeat_password)
    return res.status(400).send({ message: "password is different" });

  user = new User({
    handle: req.body.handle,
    email: req.body.email,
    password: req.body.password,
    createdAt: new Date().toISOString(),
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  const token = user.generatedAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-header", "x-auth-token")
    .send({ user: _.pick(user, ["_id", "handle", "email"]), token: token });
});

module.exports = router;
