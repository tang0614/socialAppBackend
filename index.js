const express = require("express");
const winston = require("winston");
const config = require("config");
const morgan = require("morgan");
const app = express();
require("express-async-errors");
require("express-async-error");
require("./start/cors")(app);
require("./start/logging")();
require("./start/config")();
require("./start/db")();
require("./start/routes")(app);
require("./start/prod")(app);

console.log(
  "process.env.MONGODB_URL is",
  process.env.MONGODB_URL || config.get("db")
);
console.log("process.env.NODE_ENV is ", process.env.NODE_ENV);

//HTTP request logger
app.use(morgan("tiny"));

const port = process.env.PORT || config.get("port");
const server = app.listen(port, () => {
  winston.info(`start listening on port ${port}`);
});

module.exports = server;
