const mongoose = require("mongoose");

//properties in this schema is optional, types only meaningful in mongoose not mongodb
const screamSchema = new mongoose.Schema({
  body: { type: String, required: true, minLength: 5, maxLength: 255 },
  category: {
    type: String,
    enum: ["normal", "fav"],
    lowercase: true,
    uppercase: false,
    trim: true,
    required: true,
  },
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
});

const Scream = mongoose.model("Scream", screamSchema);

module.exports = { screamSchema, Scream };
