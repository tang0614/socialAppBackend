const mongoose = require("mongoose");
//properties in this schema is optional, types only meaningful in mongoose not mongodb
const screamSchema = new mongoose.Schema({
  body: { type: String, required: true, minLength: 5, maxLength: 255 },
  commentCount: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now },
  likeCount: Number,
  userHandle: String,
  userImage: String,
  category: {
    type: String,
    enum: ["web", "mobile", "network"],
    lowercase: true,
    uppercase: false,
    trim: true,
  },
});

const Scream = mongoose.model("Scream", screamSchema);

module.exports = Scream;
