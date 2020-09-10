const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const { screamSchema } = require("./screamsdb");
//properties in this schema is optional, types only meaningful in mongoose not mongodb
//Everything in Mongoose starts with a Schema. Each schema maps to a MongoDB collection and defines the shape of the documents within that collection.
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

  //other properties
  isAdmin: Boolean,
  imageUrl: {
    type: String,
  },
  location: {
    type: String,
    minlength: 5,
    maxlength: 225,
  },
  website: {
    type: String,
    minlength: 5,
    maxlength: 1225,
  },
  bio: {
    type: String,
    minlength: 5,
    maxlength: 2225,
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// assign a function to the "methods" object of our userSchema

userSchema.methods.generatedAuthToken = function () {
  //this is pointing to the User
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

module.exports = User;
