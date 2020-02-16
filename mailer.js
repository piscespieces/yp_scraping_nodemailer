require('dotenv').config()
const data = require("./data2.json")
const nodemailer = require('nodemailer')

// Step 1
// Set up the transporter: Is what is going to connect you to which ever host domain you are using or either services that you'd like to connect to

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

// Step 2: From, To
// Map over the JSON file

const getEmailArray = data.map(res => {
    return res.emailAddress
}).join()

let mailOptions = {
    from: process.env.EMAIL,
    to: getEmailArray,
    subject: 'Nodemailer test with multiple emails comming from json file',
    html: '<h1>This is the nodemailer test ⛏ ⚙️</h1>'
}

// Step 3

transporter.sendMail(mailOptions)
    .then(function (response) {
        console.log(chalk.green('email sent!'))
    })
    .catch(function (error) {
        console.log(error)
    })
