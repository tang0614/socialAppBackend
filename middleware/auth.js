const jwt = require("jsonwebtoken");
const config = require("config");
module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) res.status(401).send({ message: "no valid token" });
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    req.user = decoded; // return back the payload which is mongodb userID
    //req.user._id is stored
    next();
  } catch (err) {
    res.status(400).send("something went wrong");
  }
};
