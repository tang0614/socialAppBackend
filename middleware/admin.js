const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //401 unauthorized
  //403 unauthorized
  //404 error request
  if (!req.user.isAdmin) return res.status(403).send("Access denied");
  next();
};
