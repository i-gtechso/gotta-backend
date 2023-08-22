/// <reference types="cypress" />
const makes = require("../../masterManu.json");
const clearSelector = "#select2-400q-container";
const manuSelector =
  "#widget-search-combos-7 > div > div:nth-child(1) > span > span.selection > span > span.select2-selection__arrow";
const keys = Object.keys(makes);
const modelArrow =
  "#widget-search-combos-7 > div > div:nth-child(2) > span > span.selection > span > span.select2-selection__arrow";
const yearArrow =
  "#widget-search-combos-7 > div > div:nth-child(2) > span > span.selection > span > span.select2-selection__arrow";
let mods = [];
context("dev.to", () => {
  beforeEach(() => {
    cy.visit("https://hollanderparts.com.au/find-auto-parts/", {
      timeout: 30000,
    });
    cy.viewport("macbook-15");
    cy.wait(1000);
  });

  it("get models", () => {
    // let makes = result.body.map((item) => {
    //   // put all articles into an array of objects with title and url
    //   // let result = { title: item.title, url: item.url };
    //   return result;
    // });
    // let sorted = titles.sort();
    // make it suitable for a json file.
    // let object = { Articles: sorted };
    // let path = `${myPath}\\articles.json`;
    // write it to my assets folder for the web display.
    // cy.writeFile(path, object);
    cy.get(manuSelector).click();
    cy.get('input[class="select2-search__field"')
      .type(keys[0])
      .type("{downarrow}")
      .type("{enter}");

    cy.wait(6000);
    cy.get(modelArrow).click();
    cy.get('span[class="select2-results"]').children.then(($li) => {
      const model = $li.text();

      cy.log(model);
    });
  });
});
