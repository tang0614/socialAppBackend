//process.env.NODE_ENV  is the environmental variable
//export process.env.NODE_ENV=production
//export debug=app:startup,app:db

//storing the password export [name]_password=

const mongoose = require("mongoose");
const config = require("config");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const screams = require("./routes/screams");
const users = require("./routes/users");
const auth = require("./routes/auth");
const genre = require("./routes/genre");

mongoose
  .connect(
    "mongodb+srv://xinyu_tang:CS2020er..@moviecluster.3sbef.mongodb.net/socialApp?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("connected to mongodb atlas");
  })
  .catch((err) => {
    for (field in express.errors) {
      console.log(ex.errors[field].message);
    }
  });

const app_debugger = require("debug")("app:startup");
const db_debugger = require("debug")("app:db");
db_debugger("connecting to the database");

const app = express();
app.use("/uploads", express.static("uploads"));
app.use(express.json()); //parse input as json object and put it as request.body, and pass it to other routes
app.use(helmet());

//Configuration
console.log("Application name", config.get("name"));
console.log("Application name", config.get("mail.password"));

if (app.get("env") === "development") {
  app.use(morgan("tiny")); //logging http requests
  app_debugger("Morgan enabled"); //same as console.log
}

if (!config.get("jwtPrivateKey")) {
  console.error("jwt key is not set");
  process.exit(1);
}

// app.use(express.urlencoded({extended:true}))
// app.use(express.static('public'))
// middle ware take request from the client and either pass response to the client or to the next middle ware function

app.use("/api/screams", screams);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/genre", genre);
//set environment var: export PORT=5000
// PORT is an environment variable
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
