var mongoose = require("mongoose");

var chat = mongoose.Schema({
  enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "enquiry" },
  channelNames: [String],
});

module.exports = mongoose.model("chat", chat);
