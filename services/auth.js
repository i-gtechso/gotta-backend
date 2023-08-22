var jwt = require("jwt-simple"),
  services = require("./");

var auth = {
  restrict: function (req, res, next) {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers["x-access-token"] || req.body.api.token;

    if (!token || token === "null") return res.status(401).send("Access token invalid");
    try {
      var decoded = jwt.decode(token, process.env.TOKEN_SECRET, true);
      services.user.get(decoded.iss, function (err, user) {
        if (err || !user) return res.status(401).send("Access token invalid");

        req.user = user;
        return next();
      });
    } catch (err) {
      return res.status(401).send("Access token invalid");
    }
  },
  assign: function (req, res, next) {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers["x-access-token"];
    if (!token || token === "null") return next();
    try {
      var decoded = jwt.decode(token, process.env.TOKEN_SECRET);

      services.user.get(decoded.iss, function (err, user) {
        if (err || !user) return next();

        req.user = user;
        return next();
      });
    } catch (err) {
      return next();
    }
  },
};

module.exports = auth;
