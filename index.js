const rp = require('request-promise');
const otcsv = require('objects-to-csv');
const cheerio = require('cheerio');
const fs = require('fs')
const chalk = require('chalk')

const baseURL = 'https://www.yellowpages.com';
const outputFile = 'data.json'
const parsedResults = []

let searchURL = '/search?search_terms=printing+services&geo_location_terms=Miami%2C+FL';
let dataWithoutEmailCounter = 0

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
                dataWithoutEmailCounter++
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
    .then(data => {
        // Save cleared data in JSON file named data.json
        fs.writeFile(outputFile, JSON.stringify(data, null, 4), (err) => {
            if (err) {
                console.log(err)
            }
        })
        console.log(`Total emails: ${data.length}`)
        console.log(`Total data without email information ${dataWithoutEmailCounter}`)
        // const transformed = new otcsv(result);
        // return transformed.toDisk('./printing_services.csv');
    })
    .then(() => console.log(chalk.green('Email list saved successfully')));

