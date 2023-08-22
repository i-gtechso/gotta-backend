var mongoose = require("mongoose");

var partImage = mongoose.Schema({
  carId: String,
  url: String,
});

module.exports = mongoose.model("partImage", partImage);
