const { isValidObjectId } = require("mongoose");
var models = require("../models");

const defaultState = {
  hasBeenRead: false,
  deliveryTime: "TBD",
  pricing: {
    price: 0,
    discount: 0,
    itemPriceDiscount: 0,
    grandTotalExlT: 0,
    total: 0,
  },
  expirationDate: "TBD",
  requestedPartNumber: "",
  warranty: "0 days",
  requestedPartNumber: "TBD",
  shipping: {
    shippingOption: "TBD",
    shippingPrice: 0,
  },
};

var quotes = {
  create: async (data, callback) => {
    const quoteData = { ...defaultState };
    quoteData.enquiry = data.enquiry;
    quoteData.car = data.car;
    quoteData.purchaser = data.purchaser;
    quoteData.timeQuoteSubmitted = new Date();
    quoteData.partName = data.partName;
    quoteData.partConditionRequested = data.partCondition;
    quoteData.qty = 1;
    quoteData.supplier = data.supplierId;
    const quote = new models.quote(quoteData);
    const associatedUser = await models.user.findById({ _id: data.supplierId });
    associatedUser.quotes.push(quote._id);
    await associatedUser.save(async (err) => {
      if (err) return callback(new Error(err));
      quote.save(callback);
    });
  },
  getQuotesByID: function (id, callback) {
    if (isValidObjectId(id)) {
      models.quote.findOne({ _id: id }, function (err, record) {
        if (err) return callback(new Error(err));
        callback(null, record);
      });
    } else {
      return callback(new Error("Bad Quote ID"));
    }
  },
  getAll: async function (supplierId, callback) {
    const data = await models.quote.find({ supplier: supplierId }).populate("car").lean().populate("purchaser");
    return callback(null, data);
  },
  getQuotesByQuoteID: function (quoteId, callback) {
    models.quote.findOne({ quoteId: quoteId }, function (err, record) {
      if (err) return callback(new Error(err));
      callback(null, record);
    });
  },
  get: function (id, callback) {
    models.quote.findById(id, function (err, record) {
      if (err) return callback(new Error(err));

      callback(null, record);
    });
  },
  getExistingQuoteByEnquiryIdAndUser: async (enquiryId, supplierId) => {
    const data = await models.quote
      .findOne({ enquiry: enquiryId, supplier: supplierId })
      .populate("car")
      .lean()
      .populate("ownerId", "address1 userRole city postalCode capricorn email firstName lastName")
      .lean()
      .populate("purchaser", "address1 city state postalCode userRole capricorn email firstName lastName")
      .populate("enquiry", "additional claimNumber vin endTime salesRep");
    return data;
  },
  getDetailedQuote: async (id) => {
    const data = await models.quote
      .findOne({ _id: id })
      .populate("car")
      .lean()
      .populate("purchaser", "address1 city state postalCode userRole capricorn email firstName lastName")
      .populate("enquiry");
    return data;
  },
  getDetailedQuoteWithCB: async (supplierId, quoteId, callback) => {
    const data = await models.quote
      .findOne({ quoteId: quoteId, supplier: supplierId })
      .populate("car")
      .lean()
      .populate("purchaser", "address1 city state postalCode userRole capricorn email firstName lastName")
      .populate("enquiry");
    callback(null, data);
  },
  getQuotesByCarWithCB: async (id, callback) => {
    const data = await models.quote.findOne({ _id: id });
    const allQuotesByEnquiry = await models.quote
      .find({ car: data.car })
      .populate("car")
      .lean()
      .populate("enquiry", "images")
      .lean()
      .populate("purchaser", "address1 city state postalCode userRole capricorn email firstName lastName")
      .lean()
      .populate("supplier");

    callback(null, allQuotesByEnquiry);
  },
  getByAuthUser: function (email, callback) {
    models.quote.find({ userEmail: email }, function (err, record) {
      if (err) return callback(new Error(err));
      callback(null, record);
    });
  },
  findMatchingQuoteInEnquiry: (quoteArr, id) => {
    return quoteArr.includes(id);
  },

  updateQuoteStatus: async (combo, callback) => {
    const updatedQuote = await models.quote.findOne({
      _id: combo.quoteId,
    });
    updatedQuote.status = "Accepted";
    updatedQuote.save(async (err) => {
      if (err) return callback(new Error(err));
      const associatedEnquiry = await models.enquiry.findById({ _id: combo.enquiryId });
      associatedEnquiry.status = "Accepted";
      associatedEnquiry.save().then((ans) => {
        return ans;
      });
    });
  },

  updateQuote: async (updatedQuoteData, callback) => {
    const originalQuote = await models.quote.findOne({
      _id: updatedQuoteData._id,
    });
    const quoteId = updatedQuoteData.quoteId && updatedQuoteData.quoteId.length > 1 ? updatedQuoteData.quoteId : originalQuote.enquiry.slice(-6);
    originalQuote.deliveryTime = updatedQuoteData.deliveryTime;
    originalQuote.expectedDelivery = updatedQuoteData.expectedDelivery;
    originalQuote.expirationDate = updatedQuoteData.offerExpiration;
    originalQuote.requestedPartNumber = updatedQuoteData.requestedPartNumber;
    originalQuote.quoteHasBeenViewedByPurchaser = false;
    originalQuote.warranty = updatedQuoteData.warranty;
    originalQuote.quoteId = quoteId;
    originalQuote.status = "awaiting approval";
    originalQuote.partConditionSubmitted = updatedQuoteData.partConditionSubmitted;
    originalQuote.pricing.price = updatedQuoteData.pricing.price;
    originalQuote.pricing.discount = updatedQuoteData.pricing.discount;
    originalQuote.pricing.tax = updatedQuoteData.pricing.tax;
    originalQuote.pricing.warranty = updatedQuoteData.pricing.warranty;
    originalQuote.pricing.grandTotalExlT = updatedQuoteData.pricing.grandTotalExlT;
    originalQuote.pricing.total = updatedQuoteData.pricing.grandTotalExlT;
    originalQuote.shipping.shippingOption = updatedQuoteData.shipping.shippingOption;
    originalQuote.shipping.shippingPrice = updatedQuoteData.shipping.shippingPrice;
    originalQuote.salesRep = updatedQuoteData.salesRep;
    originalQuote.timeQuoteSubmitted = new Date();
    originalQuote.save(async (err) => {
      if (err) return callback(new Error(err));
      const associatedEnquiry = await models.enquiry.findById({ _id: originalQuote.enquiry });
      const hasCurrentQuote = associatedEnquiry.quoteIds.length > 0 ? quotes.findMatchingQuoteInEnquiry(associatedEnquiry.quoteIds, updatedQuoteData._id) : false;
      if (!hasCurrentQuote) {
        associatedEnquiry.quoteIds.push(updatedQuoteData._id);
        associatedEnquiry.status = "in progress";
        associatedEnquiry.save(async (err) => {
          if (err) return callback(new Error(err));
          callback(null, originalQuote);
        });
      } else {
        callback(null, originalQuote);
      }
    });
  },
  alignQuoteAndEnquiry: async (alignmentData, callback) => {
    const quoteToAlign = await models.quote.findOne({
      _id: alignmentData._id,
    });

    const enquiryToAlign = await models.enquiry.findOne({
      _id: quoteToAlign.enquiry,
    });
    enquiryToAlign.status = "in progress";
    enquiryToAlign.save(async (err) => {
      callback(null, quoteToAlign);
    });
  },
};

module.exports = quotes;
