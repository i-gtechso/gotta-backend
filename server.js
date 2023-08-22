require("dotenv").config({ path: "./.env" });
var debug = require("debug")("parts-detect"),
  express = require("express"),
  logger = require("morgan"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  api = require("./routes/api"),
  images = require("./routes/images"),
  app = express(),
  cors = require("cors");

app.use(logger("dev"));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.options("*", cors());
app.use(cors());

app.use("/", api);
app.use("/images", images);

// for development only
if (app.get("env") === "development") {
  // development error handler
  // will print stacktrace
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  console.log(err);

  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {
      code: err.code,
    },
  });
});

// Handle any uncaught exceptions
// process.on("uncaughtException", function (err) {

//   services.notify.someoneAboutError(err, function (err) {

//     process.exit(1);
//   });
// });

var staging = "mongodb+srv://aleks:93N8PSh3mw3ivADT@gottacluster.e3ulq.mongodb.net/gotta-staging?retryWrites=true&w=majority";

mongoose.connect(staging, {
  dbName: "gotta-staging",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var conn = mongoose.connection;
conn.on("error", console.error.bind(console, "connection error:"));

app.set("port", process.env.PORT || 5001);
var server = app.listen(app.get("port"), function () {
  debug("Express server listening on port " + server.address().port);
});
