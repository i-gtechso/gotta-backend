const fs = require("fs");
const nodemailer = require("nodemailer");
const { models } = require("mongoose");
const helpers = require("../helpers");

var carData = {
  accountSignup: function (email, callback) {
    models.user
      .findOne({
        email: email.toLowerCase(),
      })
      .exec(async function (err, user) {
        if (err) return callback(new Error(err));
        if (!user) return callback(new Error(""));
        // if (!bcrypt.compareSync(data.password, user.password))
        // return callback(new Error("Login Failed"));

        let transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: 25,
          secure: false,
          auth: {
            user: "gotta.application@gmail.com", //email address to send from
            pass: "Gotta123", //the actual password for that account
          },
        });
        var mailOptions = {
          subject: "Gotta Registration",
        };
        mailOptions.to = user.email;
        mailOptions.bcc = "gotta.application@gmail.com";
        mailOptions.from = "gotta.application@gmail.com";
        mailOptions.html = helpers.welcomEmail.generateEmail(
          user.email,
          user.firstName
        );
        await transporter.sendMail(mailOptions, function (err, emlResponse) {
          if (err) {
            callback(err);
          } else {
            callback(emlResponse);
          }
        });
        return callback(null, user);
      });
  },
  resetPassword: async (reset, email, callback) => {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 25,
      secure: false,
      auth: {
        user: "gotta.application@gmail.com", //email address to send from
        pass: "Gotta123", //the actual password for that account
      },
    });
    var mailOptions = {
      subject: "Gotta Registration",
    };
    mailOptions.to = email;
    mailOptions.bcc = "gotta.application@gmail.com";
    mailOptions.from = "gotta.application@gmail.com";
    mailOptions.html = helpers.reset.generateEmail(email, reset);

    await transporter.sendMail(mailOptions, function (err, emlResponse) {
      if (err) {
        callback(err);
      } else {
        callback(emlResponse);
      }
    });
    return callback(null, user);
  },
};

module.exports = carData;
