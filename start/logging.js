const winston = require("winston");
// require("winston-mongodb");
const config = require("config");
require("express-async-error");
require("winston-mongodb");

module.exports = function () {
  winston.exceptions.handle(
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
    //winston.transports.Console({ colorize: true, prettyPrint: true })
  );

  // error handling occurs in express
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  winston.add(
    new winston.transports.MongoDB({
      db: config.get("db"),
      options: {
        poolSize: 2,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    })
  );

  //error handling occurs outside express
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
