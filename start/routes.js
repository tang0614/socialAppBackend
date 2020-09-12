const users = require("../routes/users");
const auth = require("../routes/auth");
const screams = require("../routes/screams");
const genre = require("../routes/genre");
const error = require("../middleware/error");
const helmet = require("helmet");
const express = require("express");

module.exports = function (app) {
  app.use(express.json()); //parse input as json object and put it as request.body, and pass it to other routes

  app.use("/uploads", express.static("uploads"));
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/genre", genre);
  app.use("/api/screams", screams);

  app.use(error);
};
