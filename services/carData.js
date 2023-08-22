const fs = require("fs");
const { isValidObjectId } = require("mongoose");
const { models } = require("mongoose");
const async = require("async");

var carData = {
  getMakes: async function (callback) {
    models.makes.find().exec(function (err, records) {
      if (err) return callback(new Error(err));
      callback(null, records);
    });
  },
  getModels: async function (callback) {
    models.makes.find().exec(function (err, records) {
      if (err) return callback(new Error(err));
      callback(null, records);
    });
  },
  create: function (data, id) {
    const carInfo = { ...data, ownerId: id };
    const car = new models.car(carInfo);
    car.save();
    return car;
  },
  getCarByID: async function (id) {
    if (isValidObjectId(id)) {
      await models.car.findOne({ _id: id }, function (err, record) {
        if (err) return new Error(err);
        return record;
      });
    } else {
      return new Error("Bad Quote ID");
    }
  },
  checkForExistingCar: async function (carIds, carDetails) {
    await models.car
      .find({ _id: { $in: carIds } }, function (err, result) {
        result = result.map(function (document) {
          return document.value;
        });
      })
      .exec((a, results) => {
        return results;
      });
  },
};

module.exports = carData;
