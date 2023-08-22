const { isValidObjectId } = require("mongoose");
var models = require("../models"),
  async = require("async");

var disputes = {
  update: function (id, data, callback) {},
  getDisputesByID: function (id, callback) {
    if (isValidObjectId(id)) {
      models.dispute.findOne({ _id: id }, function (err, record) {
        if (err) return callback(new Error(err));
        callback(null, record);
      });
    } else {
      return callback(new Error("Bad Quote ID"));
    }
  },
  getDisputesByDisputeID: function (disputeId, callback) {
    models.dispute.findOne({ disputeId: disputeId }, function (err, record) {
      if (err) return callback(new Error(err));
      callback(null, record);
    });
  },
  get: function (id, callback) {
    models.dispute.findById(id, function (err, record) {
      if (err) return callback(new Error(err));

      callback(null, record);
    });
  },
  getByAuthUser: function (email, callback) {
    models.dispute.find({ userEmail: email }, function (err, record) {
      if (err) return callback(new Error(err));
      callback(null, record);
    });
  },
};

module.exports = disputes;
