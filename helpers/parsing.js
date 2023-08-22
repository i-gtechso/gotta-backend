const carAttrArr = ["cylinder", "driveType", "engineSize", "fuelType", "make", "model", "reg", "transmissionType", "year"];
const quoteAttrArr = ["image", "partCondition", "partName", "timeSearchSubmitted", "additional"];

function isDefined(data) {
  return typeof data !== "undefined";
}

function getCarDetailsFromSearchData(data) {
  const carDetails = {};
  carAttrArr.forEach((attr) => {
    if (isDefined(data[attr])) {
      carDetails[attr] = data[attr];
    }
  });
  return carDetails;
}

function getGeneralQuoteDetailsFromSearch(data) {
  const quoteDetails = {};
  quoteAttrArr.forEach((attr) => {
    if (isDefined(data[attr])) {
      quoteDetails[attr] = data[attr];
    }
  });
  return quoteDetails;
}

function hasIdenticalYMM(car1, car2) {
  const { year: yr1, make: mk1, model: md1 } = car1;
  const { year: yr2, make: mk2, model: md2 } = car2;
  const yearsMatch = yr1 === yr2;
  const makesMatch = mk1.toUpperCase() === mk2.toUpperCase();
  const modelsMatch = md1.toUpperCase() === md2.toUpperCase();
  return yearsMatch && makesMatch && modelsMatch;
}

module.exports = {
  getCarDetailsFromSearchData,
  isDefined,
  getGeneralQuoteDetailsFromSearch,
  hasIdenticalYMM,
};
