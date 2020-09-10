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

  // access_token: [
  //     Joi.string(),
  //     Joi.number()
  // ],
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

//get personal detail
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

//get other users detail
router.get("/:handle", async (req, res) => {
  const user = await User.find({ handle: req.params.handle }).select(
    "-password"
  );
  res.send(user);
});

//authorization -whether user has token
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

  user = await user.save();
  const token = user.generatedAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-header", "x-auth-token")
    .send(_.pick(user, ["_id", "handle", "email"]));
});

//add user details
router.put("/addDetails", auth, async (req, res) => {
  let user = await User.findById(req.user._id).select("-password");
  if (!user) return res.status(400).send({ message: "user does not exists" });

  user = user.set({
    website: req.body.website,
    location: req.body.location,
    bio: req.body.bio,
  });

  await user.save();

  // return scream
  res.send(user);
});

//add user image
router.put(
  "/addImage",
  auth,
  upload.single("profileImage"),
  async (req, res) => {
    let user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(400).send({ message: "user does not exists" });
    console.log(req.file);
    user = user.set({
      imageUrl: req.file.path,
    });

    await user.save();

    res.send(user.imageUrl);
  }
);

//add friend
router.put("/:handle/follow", auth, async (req, res) => {
  //check if the documents exists
  const user = await User.find({ handle: req.params.handle });

  if (!user[0]) {
    //must return otherwise the following code will be executes
    return res.status(404).send("the user of the given id is not found");
  }

  let me = await User.findById(req.user._id);

  me = me.set({
    following: [user[0]._id],
  });

  await me.save();

  // return updated scream
  res.send(me);
});
module.exports = router;
