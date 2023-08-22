var express = require("express"),
  router = express.Router(),
  services = require("../services"),
  _ = require("underscore"),
  mongoose = require("mongoose");

router.post("/auth", async function (req, res, next) {
  if (!req.body.email || !req.body.password) return next(new Error("Missing Required Data"));
  await services.user.verify(req.body, async function (err, user) {
    if (err) return next(err);
    await services.enquiries.getByAuthUser(req.body.email, async (err, enquiries) => {
      if (err) return next(err);
      const cleanedUser = user.toFullJSON();
      const enquiriesList = cleanedUser.searchHxByCar.map((enq) => enq.enquiryId);
      await services.enquiries.getAllChatsByEnquiries(enquiriesList, (err, chats) => {
        const combinedChats = chats.map((cht) => {
          return cht.channelNames;
        });
        res.send({ enquiries: enquiries, ...cleanedUser, chats: combinedChats.flat(1) });
      });
    });
  });
});

router.post("/user", function (req, res, next) {
  if (!req.body.email || !req.body.password) return next(new Error("Missing Required Data"));
  services.user.create(req.body, function (err, user) {
    if (err) return next(err);
    // Add the user to the mailchimp list
    //services.mailchimp.onSignup(user, function(err) {
    //	if (err) services.notify.someoneAboutError(new Error('Could not add user to mailchimp: ' + user.email), function() {});
    //});
    res.send(user.toFullJSON());
  });
});

router.post("/user/email/check", function (req, res, next) {
  if (!req.body.email) return next(new Error("Missing Required Data"));
  services.user.checkIfEmailExists(req.body, function (err, user) {
    if (err) return next(err);
    res.send({
      exists: user ? true : false,
    });
  });
});

router.get("/user", services.auth.restrict, function (req, res) {
  res.send(req.user.toFullJSON());
});

router.put("/user/:id", services.auth.restrict, function (req, res, next) {
  services.user.update(req.params.id, req.body, req.user, function (err, user) {
    if (err) return next(err);
    res.send(user.toFullJSON());
  });
});

router.post("/user/searchHx", services.auth.restrict, async function (req, res, next) {
  await services.user.getSearchHxByCar(req.user, async function (err, user) {
    if (err) return next(err);
    delete user.password;
    const enquiries = await services.enquiries.getAllByUserAndCar(user);
    const byCarId = {};
    enquiries.forEach((enq) => {
      if (!byCarId[enq.car._id]) {
        byCarId[enq.car._id] = [];
        byCarId[enq.car._id].push(enq);
      } else {
        byCarId[enq.car._id].push(enq);
      }
    });
    const enquiriesByCar = [];
    user.carIds.forEach((carId) => {
      if (byCarId[carId]) {
        enquiriesByCar.push(byCarId[carId]);
      }
    });
    const data = { ...user, enquiriesByCar: enquiriesByCar, quotes: user.quotes, location: user.city };
    res.send(data);
  });
});

router.post("/user/history", function (req, res, next) {
  // TODOS
  // services.user.update(req.params.id, req.body, req.user, function (err, user) {
  //   // if (err) return next(err);
  //   res.send(user.toFullsJSON());
  // });
});

router.get("/vehicle/makes", function (req, res, next) {
  services.carData.getMakes(function (err, records) {
    if (err) return next(err);
    res.send(records);
  });
});

router.get("/vehicle/models", function (req, res, next) {
  services.carData.getModels(function (err, records) {
    if (err) return next(err);
    res.send(records);
  });
});

router.get("/vehicle/:id", function (req, res, next) {
  services.carData.getCarByID(req.params.id, function (err, records) {
    if (err) return next(err);
    res.send(records);
  });
});

router.post("/save/search", services.auth.restrict, async function (req, res, next) {
  await services.user.updateSearchHistory(req.body, req.user, function (err, records) {
    if (err) return next(err);
    res.send(records);
  });
});

router.post("/save/image", services.auth.restrict, async function (req, res, next) {
  const { partName, year, make, model, reg, uid } = req.body;
  const imageName = `${partName}-${year}-${make}-${model}-${reg}-${uid}`;
  const writeIt = await services.images.createImageFile({ ...req.body, imageName });
  services.images.uploadToCloudinary({ ...req.body, imageName }).then(async (imageSavedToCloudinary) => {
    const deleteImage = await services.images.removeImagefile(imageSavedToCloudinary.imageName);
    res.send({ imageData: imageSavedToCloudinary });
  });
});

router.post("/remove/image", services.auth.restrict, async function (req, res, next) {
  const { imageData } = req.body;
  services.images({ ...req.body, imageName }).then(async (imageSavedToCloudinary) => {
    const deleteImage = await services.images.removeImagefile(imageSavedToCloudinary.imageName);
    res.send({ imageData: imageSavedToCloudinary });
  });
});

router.get("/dispute/:id", function (req, res, next) {
  if (mongoose.isValidObjectId(req.params.id)) {
    services.disputes.getDisputesByID(req.params.id, function (err, quote) {
      if (err) return next(err);
      res.send(quote.toFullJSON());
    });
  } else {
    services.disputes.getDisputesByDisputeID(req.params.id, function (err, quote) {
      if (err) return next(err);
      res.send(quote.toFullJSON());
    });
  }
});

router.get("/keyword", services.auth.restrict, function (req, res, next) {
  services.keyword.getAll(function (err, keywords) {
    if (err) return next(err);
    res.send(keywords);
  });
});

router.get("/healthcheck", function (req, res) {
  res.send();
});

router.post("/reset", function (req, res, next) {
  services.reset.create(req.body.email, function (err, reset) {
    if (err) return next(err);
    res.send({
      _id: reset._id,
    });
  });
});

router.put("/reset/:id", function (req, res, next) {
  if (!req.body.password || !req.body.confirm) return next(new Error("Missing Required Data"));
  if (req.body.password.toLowerCase() != req.body.confirm.toLowerCase()) return next(new Error('Your passwords do not match"'));
  if (req.body.password.toLowerCase() == "password") return next(new Error('Your password cannot be "password"'));
  services.reset.updatePassword(req.params.id, req.body, function (err, reset) {
    if (err) return next(err);
    res.send({
      _id: reset._id,
    });
  });
});

router.post("/disputes/all", async function (req, res, next) {
  if (!req.body.email) return next(new Error("Missing Required Data"));
  services.disputes.getByAuthUser(req.body.email, function (err, disputes) {
    if (err) return next(err);
    res.send({ disputes: disputes });
  });
});

router.get("/token/:id?", async (req, res) => {
  const id = req.params.id;
  const tokendata = await services.tokenGenerator(id);
  res.send(tokendata);
});

router.post("/token", async (req, res) => {
  const id = req.body.id;
  const tokendata = await services.tokenGenerator(id);
  res.send(tokendata);
});

router.post("/quotes/all", services.auth.restrict, async function (req, res, next) {
  if (!req.body.email) return next(new Error("Missing Required Data"));
  const supplierId = req.user._id;
  services.quotes.getAll(supplierId, function (err, quotes) {
    if (err) return next(err);
    const a = JSON.stringify(quotes);
    res.send({ quotes: quotes });
  });
});

router.post("/quote/:id", services.auth.restrict, async function (req, res, next) {
  await services.quotes.getDetailedQuoteWithCB(req.user._id, req.params.id, function (err, records) {
    if (err) return next(err);
    res.send(records);
  });
});

router.post("/enquiry/update-rep/:id", services.auth.restrict, async function (req, res, next) {
  await services.enquiries.updateSalesRepresentative({ id: req.params.id, salesRep: req.body.salesRep }, function (err, records) {
    if (err) return next(err);
    res.send(records);
  });
});

router.post("/update-order", services.auth.restrict, async function (req, res, next) {
  const ids = req.body.cartItems.map((item) => {
    return {
      quoteId: item.quoteContextBeingViewed._id,
      enquiryId: item.quoteContextBeingViewed.enquiry._id,
    };
  });
  const unresolved = ids.map(async (combo) => {
    await services.quotes.updateQuoteStatus(combo);
    return combo;
  });
  const resolved = await Promise.all(unresolved);
  res.sendStatus(200);
});

router.post("/quote/part/:id", services.auth.restrict, async function (req, res, next) {
  await services.quotes.getQuotesByCarWithCB(req.body.quoteId, function (err, records) {
    if (err) return next(err);
    res.send(records);
  });
});

router.get("/quote/:id", function (req, res, next) {
  if (mongoose.isValidObjectId(req.params.id)) {
    services.quotes.getQuotesByID(req.params.id, function (err, quote) {
      if (err) return next(err);
      if (quote !== null) {
        res.send(quote.toFullJSON());
      } else {
        res.send("no quote associated with this id");
      }
    });
  } else {
    services.quotes.getQuotesByQuoteID(req.params.id, function (err, quote) {
      if (quote === null && err === null) {
        res.send("no quote associated with this id");
      } else {
        if (err) return next(err);
        res.send(quote.toFullJSON());
      }
    });
  }
});

router.post("/new/quote", services.auth.restrict, async function (req, res, next) {
  const { id } = req.body;
  const supplierId = req.user._id;
  const newQuoteAlreadyExists = await services.quotes.getExistingQuoteByEnquiryIdAndUser(id, supplierId);
  if (newQuoteAlreadyExists !== null) {
    res.send(newQuoteAlreadyExists);
  } else {
    const enquiryToBeConverted = await services.enquiries.getEnquiryByIdSimple(id);
    const { ownerId, timeSearchSubmitted, partName, partCondition, car, salesRep } = enquiryToBeConverted;
    const newQuote = { enquiry: id, supplierId: supplierId, car: car._id, purchaser: ownerId, timeSearchSubmitted, partName, partConditionSubmitted: partCondition, salesRep };
    await services.quotes.create(newQuote, async (err, newQuote) => {
      if (err) return next(err);
      let detailedQuote = await services.quotes.getDetailedQuote(newQuote._id);
      res.send(detailedQuote);
    });
  }
});

router.post("/save/quote", async function (req, res, next) {
  await services.quotes.updateQuote(req.body, function (err, record) {
    if (err) return next(err);
    const updatedResponse = record.toFullJSON();
    updatedResponse.purchaser = req.body.purchaser;
    res.send(req.body);
  });
});

router.post("/align/quote", async function (req, res, next) {
  await services.quotes.alignQuoteAndEnquiry(req.body, function (err, record) {
    if (err) return next(err);
    res.send({});
  });
});

router.post("/enquiries/all", services.auth.restrict, async function (req, res, next) {
  if (!req.body.email) return next(new Error("Missing Required Data"));
  const quotesRef = req.user.quotes.reduce((a, v) => ({ ...a, [v]: true }), {});
  await services.enquiries.getAllEnquiries(quotesRef, function (err, enquiries) {
    if (err) return next(err);
    res.send({ enquiries: enquiries });
  });
});

router.get("/enquiry/:id", services.auth.restrict, function (req, res, next) {
  if (mongoose.isValidObjectId(req.params.id)) {
    services.enquiries.getEnquiriesByID(req.params.id, req.user._id, function (err, enquiry) {
      if (err) return next(err);
      res.send(enquiry);
    });
  } else {
    services.enquiries.getEnquiriesByEnquiryID(req.params.id, function (err, enquiry) {
      if (err) return next(err);
      if (enquiry === null) {
        res.send({});
      } else {
        res.send(enquiry.toFullJSON());
      }
    });
  }
});

router.post("/enquiry/chat", async function (req, res, next) {
  await services.enquiries.updateChat(req.body.enquiryId, req.body.channelName);
  res.sendStatus(200);
});

router.post("/chat-details", async (req, res) => {
  const chatEnquiryList = req.body.chats;
  const records = await services.enquiries.getListOfEnquiryChatDetails(chatEnquiryList);
  res.send(records);
});

module.exports = router;
