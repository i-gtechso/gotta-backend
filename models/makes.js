var mongoose = require("mongoose");

var makes = mongoose.Schema({
  name: String,
  models: [String],
  years: [String],
});

module.exports = mongoose.model("makes", makes);
