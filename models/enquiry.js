var mongoose = require("mongoose");

var enquiry = mongoose.Schema({
  assigned: Boolean,
  endTime: String,
  car: { type: mongoose.Schema.Types.ObjectId, ref: "car" },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  partName: String,
  timeSearchSubmitted: String,
  partCondition: String,
  images: [String],
  additional: { notes: String },
  quoteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "quote" }],
  status: String,
  carId: mongoose.Schema.Types.ObjectId,
  dueBy: String,
  claimNumber: String,
  vin: String,
  color: String,
  salesRep: { type: String, default: "" },
});

enquiry.methods.toJSON = function () {
  var obj = this.toObject();

  return obj;
};

enquiry.methods.toFullJSON = function () {
  var obj = this.toObject();

  return obj;
};

module.exports = mongoose.model("enquiry", enquiry);
