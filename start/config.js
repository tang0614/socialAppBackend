const config = require("config");

module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    throw new Error("Fatal error: jwtPrivateKey is not defined");
  }
  if (!config.get("db")) {
    throw new Error("Fatal error: mongoAtlas is not connected");
  }
};
