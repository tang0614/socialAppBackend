const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
//properties in this schema is optional, types only meaningful in mongoose not mongodb
const userSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 225,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 225,
    unique: true,
  },
  password: { type: String, required: true, minlength: 5, maxlength: 1024 },
  isAdmin: Boolean,
});

userSchema.methods.generatedAuthToken = function () {
  //this is pointing to the user
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

module.exports = User;
