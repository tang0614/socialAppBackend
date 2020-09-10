// app.use(express.urlencoded({extended:true}))
// app.use(express.static('public'))
// middle ware take request from the client and either pass response to the client or to the next middle ware function

//set environment var: export PORT=5000
// PORT is an environment variable

const express = require("express");
const winston = require("winston");
const config = require("config");
const morgan = require("morgan");

const app = express();
require("express-async-error");
require("./start/cors")(app);
require("./start/logging")();
require("./start/config")();
require("./start/db")();
require("./start/routes")(app);
require("./start/prod")(app);

//In production mode
if (process.env.NODE_ENV === "production") {
  app.use(express.static("./client/build"));
}
//HTTP request logger
app.use(morgan("tiny"));

// Express serve up index.html file if it doesn't recognize route
const path = require("path");
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

const port = process.env.PORT || config.get("port");
const server = app.listen(port, () => {
  winston.info(`start listening on port ${port}`);
});

module.exports = server;
