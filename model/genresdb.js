const mongoose = require("mongoose");

//properties in this schema is optional, types only meaningful in mongoose not mongodb
const GenreSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    minlength: 5,
    maxlength: 50,
  },
});

const Genre = mongoose.model("Genre", GenreSchema);

module.exports = Genre;
module.exports.GenreSchema = GenreSchema;
