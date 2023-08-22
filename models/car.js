var mongoose = require("mongoose");

var car = mongoose.Schema({
  abn: String,
  date: Date,
  make: String,
  model: String,
  vehicleDescription: String,
  isVendor: Boolean,
  cylinder: String,
  driveType: String,
  engineSize: String,
  fuelType: String,
  reg: String,
  transmissionType: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  partSearch: [
    {
      code: String,
      name: String,
    },
  ],
  year: String,
});

module.exports = mongoose.model("car", car);
