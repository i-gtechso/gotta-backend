var mongoose = require("mongoose");

var order = mongoose.Schema({
  date: Date,
  name: String,
  email: String,
  total: Number,
  vin: String,
  vehicle: String,
  partsProvider: [
    {
      lineCode: String,
      partNumber: String,
      shopCost: Number,
      adjustmentAmount: Number,
      sku: String,
      qty: Number
    }
  ]
});

module.exports = mongoose.model("order", order);
