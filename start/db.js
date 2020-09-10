const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");
require("dotenv").config();

// module.exports = function () {
//   mongoose
//     .connect(
//       "mongodb+srv://xinyu_tang:CS2020er..@moviecluster.3sbef.mongodb.net/socialApp?retryWrites=true&w=majority",
//       { useNewUrlParser: true, useUnifiedTopology: true }
//     )
//     .then(() => {
//       winston.info("connected to mongodb atlas");
//     });
// };

module.exports = function () {
  //connect mongoose with mongo db named movieDB
  mongoose
    .connect(process.env.MONGODB_URL || config.get("db"), {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => {
      winston.info(`connecting to ${config.get("db")}..`);
      winston.info(`connecting successfully`);
    });
};
