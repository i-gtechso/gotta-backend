var mongoose = require("mongoose");

var user = mongoose.Schema({
  abn: { type: String, default: "" },
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  api: {
    token: String,
    expires: Date,
  },
  address1: String,
  address2: String,
  userRole: String,
  city: String,
  state: String,
  postalCode: String,
  mode: String,
  lastSeen: String,
  searchHxByCar: [],
  quotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "quote" }],
  capricorn: String,
  carIds: [String],
  orders: [String],
  isDismantler: { type: Boolean, default: false },
  entityName: { type: String, default: "" },
});

user.methods.toJSON = function () {
  var obj = this.toObject();

  delete obj.email;
  delete obj.password;
  delete obj.api;

  return obj;
};

user.methods.toFullJSON = function () {
  var obj = this.toObject();

  delete obj.password;

  return obj;
};

module.exports = mongoose.model("user", user);
