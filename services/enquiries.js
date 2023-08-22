const { isValidObjectId } = require("mongoose");
const models = require("../models");

const enquiries = {
  create: function (data, car, ownerId) {
    const carId = typeof car._id !== "undefined" ? car._id : car;
    const enquiryInfo = { ...data, car: carId, ownerId, endTime: data.dueBy, status: "new" };
    const enquiry = new models.enquiry(enquiryInfo);
    enquiry.save();
    return enquiry;
  },
  getAllByUserAndCar: async function (user) {
    const data = await models.enquiry.find({ ownerId: user._id }).populate("car").populate("quoteIds");
    const activeOnly = data.filter((enq) => {
      if (enq.status !== "Accepted") {
        return enq;
      }
    });
    return activeOnly;
  },
  getAllEnquiries: async (quoteIdsObj, callback) => {
    const data = await models.enquiry
      .find({})
      .populate("car")
      .lean()
      .populate("ownerId", "address1 address2 city state userRole isDismantler postalCode capricorn email entityName");
    const filteredByUser = data.filter((enq) => {
      const updatedEnq = { ...enq };
      enq.quoteIds.map((q) => {
        if (quoteIdsObj[q]) {
          updatedEnq.status = "in progress";
        } else {
          if (enq.status !== "Accepted") {
            updatedEnq.status = "New";
          }
        }
      });
      return updatedEnq;
    });
    callback(null, filteredByUser);
  },
  getAllEnquiriesTest: async (callback) => {
    await models.enquiry.aggregate([]);
  },
  update: function (id, data, callback) {},
  getEnquiryByIdSimple: async (id) => {
    const data = await models.enquiry.findOne({ _id: id }).populate("car");
    return data;
  },
  getEnquiriesByID: async (id, userId, callback) => {
    if (isValidObjectId(id)) {
      const data = await models.enquiry
        .findOne({ _id: id })
        .populate("car")
        .lean()
        .populate("ownerId", "address1 address2 city state userRole postalCode capricorn email firstName lastName")
        .lean()
        .populate("quoteIds");
      const filteredQuotes = data.quoteIds.filter((q) => {
        if (q.supplier.toString() === userId.toString()) {
          return q;
        }
      });
      const filteredData = { ...data };
      filteredData.quoteIds = filteredQuotes;
      callback(null, filteredData);
    } else {
      return callback(new Error("Bad Quote ID"));
    }
  },
  getListOfUserEnquiries: async function (enquiryIds) {
    try {
      models.enquiry
        .find({ _id: { $in: enquiryIds } }, function (err, result) {
          result = result.map(function (document) {
            return document.value;
          });
        })
        .exec((a, results) => {
          return results;
        });
    } catch (err) {}
    return callback(new Error(err));
  },
  getEnquiriesByEnquiryID: function (enquiryId, callback) {
    if (enquiryId === 1) {
      models.enquiry.find({}, function (err, record) {
        if (err) return callback(new Error(err));
        return record;
      });
    } else {
      models.enquiry.findOne({ enquiryId: enquiryId }, function (err, record) {
        if (err) return callback(new Error(err));
        return record;
      });
    }
  },
  get: function (id, callback) {
    models.enquiry.findById(id, function (err, record) {
      if (err) return callback(new Error(err));

      callback(null, record);
    });
  },
  getByAuthUser: function (email, callback) {
    models.enquiry.find({ businessOwnerEmail: email }, function (err, record) {
      if (err) return callback(new Error(err));
      callback(null, record);
    });
  },
  getByAuthUser: function (email, callback) {
    models.enquiry.find({ businessOwnerEmail: email }, function (err, record) {
      if (err) return callback(new Error(err));
      callback(null, record);
    });
  },
  updateSalesRepresentative: async (data, callback) => {
    const originalEnquiry = await models.enquiry.findOne({
      _id: data.id,
    });
    originalEnquiry.salesRep = data.salesRep;
    originalEnquiry.save(async (err) => {
      callback(null, originalEnquiry);
    });
  },
  getListOfEnquiryChatDetails: async (data) => {
    const checkAnswer = await models.enquiry.find({ _id: { $in: data } });
    // .populate("car", "year make model")
    // .lean()
    // .populate("ownerId", "city state firstName lastName")
    // .lean();
    return checkAnswer;
  },
  updateChat: async (enquiryId, newChannelName) => {
    let currentChatList = await models.chat.findOne({ enquiryId: enquiryId });
    if (currentChatList === null) {
      currentChatList = new models.chat({ enquiryId: enquiryId, channelNames: [newChannelName] });
      currentChatList.save();
      return currentChatList;
    } else {
      const hasChannel = currentChatList.channelNames.includes(newChannelName);
      if (hasChannel) {
        return currentChatList;
      } else {
        currentChatList.channelNames.push(newChannelName);
        currentChatList.save();
        return currentChatList;
      }
    }
  },
  getAllChatsByEnquiries: async (idList, callback) => {
    const list = await models.chat.find({ enquiryId: { $in: idList } });
    callback(null, list);
  },
};

module.exports = enquiries;
