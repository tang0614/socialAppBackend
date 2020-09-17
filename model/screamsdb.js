const mongoose = require("mongoose");
const { GenreSchema } = require("./genresdb");

//properties in this schema is optional, types only meaningful in mongoose not mongodb
const ScreamSchema = new mongoose.Schema({
  body: { type: String, required: true, minLength: 5, maxLength: 1000 },

  authorName: {
    type: String,
    required: true,
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

  genre: {
    type: GenreSchema,
  },
});

const Scream = mongoose.model("Scream", ScreamSchema);

module.exports = Scream;
module.exports.ScreamSchema = ScreamSchema;
