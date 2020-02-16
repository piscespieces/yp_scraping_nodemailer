const rp = require('request-promise');
const otcsv = require('objects-to-csv');
const cheerio = require('cheerio');
const fs = require('fs')
const chalk = require('chalk')

const baseURL = 'https://www.yellowpages.com';
let searchURL = '/search?search_terms=printing+services&geo_location_terms=Miami%2C+FL';
const outputFile = 'data.json'
let counter = 0
const parsedResults = []

const getCompanies = async () => {
    try {
        const html = await rp(baseURL + searchURL);
        const businessMap = cheerio('a.business-name', html).map(async (i, e) => {
            const link = baseURL + e.attribs.href;
            const innerHtml = await rp(link);

            const emailAddress = cheerio('a.email-business', innerHtml).prop('href')

            const name = e.children[0].data || cheerio('h1', innerHtml).text();
            const phone = cheerio('p.phone', innerHtml).text();

            const metadata = {
                emailAddress: emailAddress ? emailAddress.replace('mailto:', '') : undefined,
                link,
                name,
                phone,
            }

            if (metadata.emailAddress !== undefined) {
                parsedResults.push(metadata)
            } else {
                counter++
            }

        })

        const nextPageLink = cheerio('.pagination', html).children('ul').children().last().children()[0].attribs.href

        if (nextPageLink) {
            searchURL = nextPageLink
            return getCompanies();
        }

        return parsedResults;

    } catch (error) {
        console.log(error)
    }

};

getCompanies()
    .then(result => {
        fs.writeFile(outputFile, JSON.stringify(result, null, 4), (err) => {
            if (err) {
                console.log(err)
            }
        })
        console.log(result.length)
        console.log(counter)
        // const transformed = new otcsv(result);
        // return transformed.toDisk('./printing_services.csv');
    })
    .then(() => console.log('Success'));

