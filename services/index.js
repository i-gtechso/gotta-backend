/*!
 * Module exports.
 */

/** general app services */
exports.auth = require("./auth");
exports.user = require("./user");
exports.reset = require("./reset");
exports.mailchimp = require("./mailchimp");
exports.carData = require("./carData");
exports.notify = require("./notify");
exports.images = require("./images");
exports.tokenGenerator = require("./chatTokenGenerator");

/** indiv page services */
exports.quotes = require("./quotes");
exports.enquiries = require("./enquiries");
exports.disputes = require("./disputes");
