/// <reference types="cypress" />
const makes = require("../../masterManu.json");
const clearSelector = "#select2-400q-container";
const manuSelector =
  "#widget-grid-7 > div.his-step-combo-container.row > div.col-12.col-md-3.his-step-combo > span > span.selection > span";
const keys = Object.keys(makes);
context("dev.to", () => {
  beforeEach(() => {
    cy.visit(`http://hollanderparts.com.au/`, { timeout: 300000 });
    cy.viewport("macbook-15");
    cy.wait(3000);
  });

  // it("get makes", () => {
  //   cy.request('https://hollanderparts.com.au/find-auto-parts-by-make/')
  //     .then(response => {
  //       const s = response.body.indexOf('<option value="">Make</option>');
  //       const firstCut = response.body.slice(s + 30);
  //       const lastTrim = firstCut.slice(0, firstCut.indexOf('</select'))
  //       const list = lastTrim.split("<option value='")
  //       list.shift();
  //       const ref = {}
  //       list.forEach(li => {
  //         const s = li.indexOf("' >");
  //         const n = li.slice(0, s);
  //         const e = li.indexOf('</option>')
  //         const info = li.slice(s + 3, e);
  //         ref[info] = {
  //           name: n
  //         }
  //       })
  //       cy.writeFile(myPath, JSON.stringify(ref));
  //     })

  //   cy.visit('https://hollanderparts.com.au/find-auto-parts-by-make/', { timeout: 30000 });
  // })

  it("get models", () => {
    cy.visit("https://hollanderparts.com.au/find-auto-parts-by-make/", {
      timeout: 30000,
    });

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

    cy.wait(3000);
  });
});
