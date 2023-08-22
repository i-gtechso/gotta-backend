var mongoose = require("mongoose");

var pricingType = mongoose.Schema({
  price: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  itemPriceDiscount: { type: Number, default: 0 },
  grandTotalExlT: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  warranty: { type: Number, default: 0 },
});

var shippingType = mongoose.Schema({
  shippingOption: { type: String, default: "TBD" },
  shippingPrice: { type: Number, default: 0 },
});

var quote = mongoose.Schema({
  purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  car: { type: mongoose.Schema.Types.ObjectId, ref: "car" },
  enquiry: { type: mongoose.Schema.Types.ObjectId, ref: "enquiry" },
  pricing: pricingType,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  supplierLocation: String,
  timeQuoteSubmitted: { type: Date, default: new Date() },
  expectedDelivery: { type: String, default: "" },
  deliveryTime: { type: String, default: "" },
  expirationDate: { type: String, default: "" },
  warranty: { type: String, default: "" },
  partConditionSubmitted: { type: String, default: "" },
  status: { type: String, default: "New" },
  quoteHasBeenViewedByPurchaser: { type: Boolean, default: false },
  requestedPartNumber: { type: String, default: "0" },
  images: Array,
  shipping: shippingType,
  qty: { type: String, default: 0 },
  partName: String,
  partConditionRequested: String,
  quoteId: String,
  salesRep: String,
});

quote.methods.toJSON = function () {
  var obj = this.toObject();

  return obj;
};

quote.methods.toFullJSON = function () {
  var obj = this.toObject();

  return obj;
};

module.exports = mongoose.model("quote", quote);
