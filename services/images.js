var { isValidObjectId } = require("mongoose");
var models = require("../models");
var fs = require("fs");
var cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dbfv0bfmw",
  api_key: "948862613181711",
  api_secret: "gjHHKeyL_taBr1fvDUflV_sFSY0",
});

var images = {
  create: async function (data) {
    const partImageInfo = { carId: data.carId, url: data.url, remove: false };
    const partImage = new models.partImage(partImageInfo);
    partImage.save();
    return partImage;
  },
  remove: async function (imageId) {
    if (isValidObjectId(imageId)) {
      await models.images.findById(imageId, function (err, image) {
        image.toBeDeleted = true;
        image.save();
      });
    } else {
      return false;
    }
  },
  createImageFile: async function (data) {
    const base64Data = data.image;
    const name = data.imageName + ".png";
    const imageName = name.split(" ").join("");
    return new Promise(function (resolve, reject) {
      fs.writeFile(imageName, base64Data, "base64", function (err) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  },
  removeImagefile: async function (imageName) {
    return new Promise(function (resolve, reject) {
      fs.unlink(imageName, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(imageName);
        }
      });
    });
  },
  uploadToCloudinary: async function (data) {
    const name = data.imageName + ".png";
    const imageName = name.split(" ").join("");
    const tags = imageName.split("-");
    return new Promise(function (resolve, reject) {
      cloudinary.uploader.upload(imageName, { tags: tags }, async function (err, image) {
        if (err) {
          reject(err);
        }
        const savedImage = await images.create({ uploadRef: data.imageName, url: image.url });
        const imageData = savedImage.toObject();
        resolve({ ...imageData, imageName });
      });
    });
  },
  destroyViaCloudinary: async function (data) {
    //todo fix
    // imageData {
    //   _id: '61dbd6ad5908aa40f203188b',
    //   url: 'http://res.cloudinary.com/dbfv0bfmw/image/upload/v1641797293/xjudmxyfoscyzc0f269m.jpg',
    //   __v: 0,
    //   imageName: 'Asdads-2017-NISSAN-370Z-Test-ae02a8a1-dbde-45b9-b024-c48e42ebda55.png'
    // }
    return new Promise(function (resolve, reject) {
      cloudinary.api.delete(["srjyvesyw76zqfxrc3iw", "hrclal95swu0ecdtgp6a", "rkalwxeagk3mgplztm9o"], async function (err, image) {
        if (err) {
          reject(err);
        }
        resolve({ image });
      });
    });
  },
};

module.exports = images;
