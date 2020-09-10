const mongoose = require("mongoose");
const { GenreSchema } = require("./genresdb");

//properties in this schema is optional, types only meaningful in mongoose not mongodb
const ScreamSchema = new mongoose.Schema({
  body: { type: String, required: true, minLength: 5, maxLength: 255 },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scream",
    },
  ],
  likeBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  genre: {
    type: GenreSchema,
  },
});

const Scream = mongoose.model("Scream", ScreamSchema);

module.exports = Scream;
module.exports.ScreamSchema = ScreamSchema;
