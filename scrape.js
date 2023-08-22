// <reference types="cypress" />
let myName = 'HolyToledo';
let myPath = 'C:\\Users\\someSecretPath\\assets\\devArticles'

context("dev.to", () => {
    it("get all my articles", () => {
        // get all of my dev.to articles
        cy.request(`https://dev.to/api/articles? 
       username=${myName}&per_page=2000`).then(
            (result) => {
                let titles = result.body.map((item) => {
                    // put all articles into an array of objects with title and url
                    let result = { title: item.title, url: item.url };
                    return result;
                });
                let sorted = titles.sort();
                // make it suitable for a json file.
                let object = { Articles: sorted };
                let path = `${myPath}\\articles.json`;
                // write it to my assets folder for the web display.
                cy.writeFile(path, object);
            }
        );
    })
});
