const { parsing } = require("../helpers");
var models = require("../models"),
  bcrypt = require("bcrypt"),
  jwt = require("jwt-simple"),
  moment = require("moment"),
  async = require("async"),
  services = require(".");

var user = {
  create: function (data, callback) {
    const userData = { ...data };
    var user = new models.user(userData);
    user.email = user.email.toLowerCase();
    user.password = bcrypt.hashSync(data.password, 10);
    user.isDismantler = userData.abn && userData.abn.length > 0 ? true : false;
    user.entityName = userData.abn && userData.abn.length > 0 ? userData.name : `${userData.firstName} ${userData.lastName[0]}`;
    user.mode = "TEST";

    async.series(
      [
        function (callback) {
          models.user
            .findOne({
              email: user.email,
            })
            .exec(function (err, record) {
              if (err) return callback("An error occurred");
              if (record) return callback("That email is not available");
              user.save(callback);
            });
        },
        function (callback) {
          var expires = moment().add(1, "years").valueOf(),
            token = jwt.encode(
              {
                iss: user._id,
                exp: expires,
              },
              process.env.TOKEN_SECRET
            );
          user.api = {
            token: token,
            expires: expires,
          };
          user.save(callback);
        },
      ],
      function (err) {
        if (err) {
          try {
            if (user._id) user.remove();
          } catch (err) {}
          return callback(new Error(err));
        }

        callback(null, user);
      }
    );
  },
  updateSearchHistory: async function (data, userData, callback) {
    delete data.access_token;
    const { dueBy, year, make, model, reg, images, claimNumber, vin = "", color = "" } = data;
    data.timeSearchSubmitted = new Date();
    let updatedDate = formatDate(dueBy);
    data.dueBy = updatedDate.toString();
    await this.getAllCars(userData.carIds, async function (err, ownerCars) {
      let carDetails = parsing.getCarDetailsFromSearchData(data);
      let enquiryDetails = parsing.getGeneralQuoteDetailsFromSearch(data);
      enquiryDetails.vin = vin;
      enquiryDetails.color = color;
      enquiryDetails.images = images;
      enquiryDetails.dueBy = dueBy;
      enquiryDetails.claimNumber = claimNumber;
      /**CHECK IF THE CAR EXISTS WITHIN USER HISTORY*/
      if (userData.carIds.length > 0) {
        let has_ymm_match = false;
        ownerCars.forEach((car) => {
          const match = parsing.hasIdenticalYMM(car, carDetails);
          if (match) {
            has_ymm_match = true;
            carDetails = car.toObject();
          }
        });
        if (!has_ymm_match) {
          /**IF NO MATCHES FOUND, IT'S A NEW CAR, SAVE NEW CAR DATA*/
          const savedCar = await services.carData.create(carDetails, userData._id);
          const newCarIdArr = [...userData.carIds];
          newCarIdArr.push(savedCar._id);
          carDetails = savedCar.toObject();
          userData.carIds = newCarIdArr;
        }
      } else {
        /**IF NO CARIDS SAVED, ITS 1ST ATTEMPT, SAVE NEW CAR DATA*/
        const savedCar = await services.carData.create(carDetails, userData._id);
        carDetails._id = savedCar._id;
        const newCarIdArr = [...userData.carIds];
        newCarIdArr.push(savedCar._id);
        userData.carIds = newCarIdArr;
      }
      if (err) return callback(err);
      const enquiriesByCar = [...userData.searchHxByCar];
      const carId = carDetails._id;
      const savedEnquiry = await services.enquiries.create(enquiryDetails, carDetails, userData._id);
      const saved = savedEnquiry.toObject();
      enquiriesByCar.push({
        enquiryId: saved._id,
        enquiry: saved,
        partName: saved.partName,
        currentActiveQuotes: saved.quoteIds.length,
        newQuotes: saved.newQuoteIds && saved.newQuoteIds.length,
      });
      userData.searchHxByCar = enquiriesByCar;
      userData.save(function (err, record) {
        if (err) return callback(new Error(err));
        const updatedUserData = record.toObject();
        callback(null, { ...updatedUserData, car: carDetails });
      });
    });
  },
  getByEmail: function (email, callback) {
    models.user.findOne({ email: email }, function (err, record) {
      if (err) return callback(new Error(err));

      callback(null, record);
    });
  },
  update: function (userId, data, user, callback) {
    if (typeof data.updatePasswordConfirm !== "undefined" && data.updatePasswordConfirm.length > 0 && data.updatePassword !== data.updatePasswordConfirm) {
      return callback("Updated Passwords Do Not Match");
    } else if (typeof data.updatePasswordConfirm !== "undefined" && data.updatePasswordConfirm.length > 0 && data.updatePasswordConfirm.length < 6) {
      return callback("Updated Passwords Should Be Longer");
    }
    //     user.password = bcrypt.hashSync(data.password, 10);
    if (!user._id.equals(userId)) return callback("Invalid User");
    async.series(
      [
        function (callback) {
          if (data.email.toLowerCase() == user.email) return callback();

          models.user
            .findOne({
              email: data.email.toLowerCase(),
            })
            .exec(function (err, record) {
              if (err) return callback(err);
              if (record) return callback("That email is not available");

              return callback();
            });
        },
        function (callback) {
          if (typeof data.updatePasswordConfirm !== "undefined" && data.updatePasswordConfirm.length > 5) {
            user.password = data.password;
          }
          user.name = data.name;
          user.email = data.email;
          user.address1 = data.address1;
          user.address2 = data.address2;
          user.city = data.city;
          user.state = data.state;
          user.zip = data.zip;

          user.save(callback);
        },
      ],
      function (err) {
        if (err) return callback(new Error(err));

        callback(null, user);
      }
    );
  },
  verify: function (data, callback) {
    models.user
      .findOne({
        email: data.email.toLowerCase(),
      })
      .exec(function (err, record) {
        if (err) return callback(new Error(err));
        if (!record) return callback(new Error("Login Failed"));
        if (!bcrypt.compareSync(data.password, record.password)) return callback(new Error("Login Failed"));

        return callback(null, record);
      });
  },
  checkIfEmailExists: function (data, callback) {
    models.user.findOne({ email: data.email.toLowerCase() }).exec(function (err, record) {
      if (err) return callback(new Error(err));

      callback(null, record);
    });
  },
  getByEmail: function (email, callback) {
    models.user.findOne({ email: email }, function (err, record) {
      if (err) return callback(new Error(err));

      callback(null, record);
    });
  },
  getAllCars: function (carIds, callback) {
    models.car.find({ _id: { $in: carIds } }, function (err, record) {
      if (err) return callback(new Error(err));

      callback(null, record);
    });
  },
  get: function (id, callback) {
    models.user.findById(id, function (err, record) {
      if (err) return callback(new Error(err));

      callback(null, record);
    });
  },
  updatePassword: function (id, password, callback) {
    this.get(id, function (err, user) {
      if (err) return callback(err);

      // user.password = bcrypt.hashSync(password, 10);
      user.save(function (err) {
        if (err) return callback(new Error(err));

        callback(null, user);
      });
    });
  },
  testSchema: function (callback) {
    //   async.series(
    //     [
    //       async function(callback) {
    //         models.user.find({}).exec(async function(err, record) {
    //           record.forEach(async user => {
    //             user.searchHx = [
    //               {
    //                 vin: "a12345",
    //                 year: "2020",
    //                 make: "bmw",
    //                 "model" :"model",
    //                 searchTerm: {}
    //               },
    //               {
    //                 vin: "b12345",
    //                 year: "2019",
    //                 make: "ferrari",
    //                 "model" :"model",
    //                 searchTerm: {}
    //               },
    //               {
    //                 vin: "c12345",
    //                 year: "2018",
    //                 make: "tesla",
    //                 "model" :"model",
    //                 searchTerm: {}
    //               }
    //             ];
    //             await user.save();
    //           });
    //           if (err) return callback(err);
    //           if (record) return callback("That email is not available");
    //           return callback();
    //         });
    //       },
    //       function(callback) {
    //         user.schemaVersion = "1";
    //         user.save(callback);
    //       }
    //     ],
    //     function(err) {
    //       if (err) return callback(new Error(err));
    //       callback(null, user);
    //     }
    //   );
  },
  getSearchHxByCar: function (data, callback) {
    models.user
      .findOne({
        email: data.email.toLowerCase(),
      })
      .exec(function (err, record) {
        if (err) return callback(new Error(err));
        if (!record) return callback(new Error("No Search History"));
        // if (!bcrypt.compareSync(data.password, record.password))
        //   return callback(new Error("Login Failed"));
        return callback(null, record.toObject());
      });
  },
};

module.exports = user;

function formatDate(dateString) {
  const dateParts = dateString.split("/");

  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}
