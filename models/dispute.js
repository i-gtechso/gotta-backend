var mongoose = require("mongoose");

var dispute = mongoose.Schema({
  date: Date,
  supplier: String,
  hasBeenRead: Boolean,
  total: String,
  deliveryTimme: String,
  condition: String,
  warranty: String,
  shippingOption: String,
  price: String,
  shippingPrice: String,
  discount: String,
  expirationDate: String,
  requestedPartNumber: String,
  images: Array,
  qty: Number,
  disputeId: String,
  itemPriceDiscount: String,
  grandTotalExlT: String,
  supplierLocation: String,
  name: String,
});

dispute.methods.toJSON = function () {
  var obj = this.toObject();

  return obj;
};

dispute.methods.toFullJSON = function () {
  var obj = this.toObject();

  return obj;
};

module.exports = mongoose.model("dispute", dispute);
