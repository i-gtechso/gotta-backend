var mongoose = require("mongoose");

var images = mongoose.Schema({
  user: String,
  url: [String],
  carId: String,
  quoteId: String,
  toBeDeleted: Boolean,
});

module.exports = mongoose.model("images", images);
