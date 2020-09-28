const mongoose = require("mongoose");
// const { GenreSchema } = require("./genresdb");

//properties in this schema is optional, types only meaningful in mongoose not mongodb
const ScreamSchema = new mongoose.Schema({
  body: { type: String, required: true, minLength: 3, maxLength: 1000 },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    required: true,
  },
  commentOn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scream",
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scream",
    },
  ],
  retweetOn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scream",
  },
  retweets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scream",
    },
  ],

  // genre: {
  //   type: GenreSchema,
  // },
});

const Scream = mongoose.model("Scream", ScreamSchema);

module.exports = Scream;
module.exports.ScreamSchema = ScreamSchema;
