const winston = require("winston");
//only works under express api request
module.exports = function (err, req, res, next) {
  winston.error(err.message, err);
  return res.status(500).send({ message: "something wrong" });
};
