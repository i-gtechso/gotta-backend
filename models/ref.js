var pricingType = mongoose.Schema({
  price: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  itemPriceDiscount: { type: Number, default: 0 },
  grandTotalExlT: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

var shippingType = mongoose.Schema({
  shippingOption: { type: String, default: "TBD" },
  shippingPrice: { type: String, default: "TBD" },
});

var quote = mongoose.Schema({
  purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  car: { type: mongoose.Schema.Types.ObjectId, ref: "car" },
  pricing: pricingType,
  supplier: mongoose.Schema.Types.ObjectId,
  supplierLocation: String,
  timeSearchSubmitted: Date,
  deliveryTime: { type: String, default: "TBD" },
  expirationDate: { type: String, default: "TBD" },
  quoteHasBeenViewedByPurchaser: { type: Boolean, default: false },
  requestedPartNumber: { type: String, default: "N/A" },
  images: Array,
  warranty: { type: String, default: "TBD" },
  shipping: shippingType,
  qty: Number,
  enquiry: { type: mongoose.Schema.Types.ObjectId, ref: "enquiry" },
  partName: String,
  partConditionRequested: String,
  partConditionSubmitted: { type: String, default: "TBD" },
  status: { type: String, default: "New" },
});
