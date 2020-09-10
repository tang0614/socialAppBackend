const mongoose = require("mongoose");
const { screamSchema } = require("../model/screamsdb");

//properties in this schema is optional, types only meaningful in mongoose not mongodb
const notificationSchema = new mongoose.Schema({
  sender: { type: String, required: true, minLength: 5, maxLength: 255 },
  recipient: { type: String, required: true, minLength: 5, maxLength: 255 },
  category: {
    type: String,
    enum: ["like", "comment"],
    required: true,
  },
  read: { type: Boolean, required: true },
  scream: { type: screamSchema, required: true },
});

const Scream = mongoose.model("Notification", notificationSchema);

module.exports = notificationSchema;
