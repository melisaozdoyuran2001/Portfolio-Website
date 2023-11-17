// Import necessary modules and configuration
require('dotenv').config(); // Loads environment variables from a .env file
const express = require("express"); // Express framework for building web applications
const path = require("path"); // Provides utilities for working with file and directory paths
const exphbs = require("express-handlebars"); // Handlebars view engine for Express
const bodyParser = require("body-parser"); // Middleware to parse incoming request bodies
const projects = require("./projects.json"); // Import a JSON file containing project data
const nodemailer = require('nodemailer'); // Module to send emails easily
const sgTransport = require('nodemailer-sendgrid-transport'); // Transport layer for Nodemailer to send emails through SendGrid

const app = express(); // Initialize an Express application

// Body parser setup
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded bodies (like HTML forms)
app.use(bodyParser.json()); // Parses JSON bodies

// Static files setup
app.use(express.static(path.join(__dirname, "/public"))); // Serves static files from the /public directory
app.use(express.static('public'));

// Handlebars setup with custom helper
const hbs = exphbs.create({
    extname: ".hbs", // Set the file extension for views to .hbs
    defaultLayout: false, // Disables default layout
    helpers: {
        eq: (a, b) => a === b // Custom helper 'eq' for comparison in templates
    }
});

// Nodemailer with SendGrid setup
const options = {
    auth: {
        api_key: process.env.SENDGRID_API_KEY // Authentication with SendGrid using an API key from the environment variables
    }
}
const transporter = nodemailer.createTransport(sgTransport(options)); // Create a Nodemailer transporter using SendGrid

// Routes
// Define routes for different URLs, each rendering a specific Handlebars view
app.get("/", (req, res) => {
    res.render("home"); // Renders the home view
});

app.get("/contact", (req, res) => {
    res.render("contact", { submitted: "no" }); // Renders the contact view with a variable
});

app.get("/work", (req, res) => {
    res.render("work", { projects: projects }); // Renders the work view with projects data
});


app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/experience", (req, res) => {
    res.render("experience");
});

app.get("/fun", (req, res) => {
    res.render("fun");
});

app.get("/games", (req, res) => {
    res.render("games");
});

app.get("/project/:pid([0-9]+)", (req, res) => {
    var pid = req.params.pid;
    var thisProj = projects[pid.toString()];
    res.render("project", { project: thisProj });
});


// Handle POST request on the contact form
app.post("/contact", (req, res) => {
    const { fullname, email, subject, note } = req.body; // Extract data from the request body

    let mailOptions = {
        from: process.env.EMAIL_USER, // Sender address from environment variables
        to: "melisaozdoyuran@hotmail.com", // Hardcoded recipient address
        subject: `Contact Form - ${subject}`, // Subject line with a template literal
        text: `
From: ${fullname} (${email})
Subject: ${subject}

${note}
        ` // Construct the email body
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
            res.render("contact", { submitted: "error" }); // Render contact view with error status
        } else {
            console.log("Email sent:", info.response);
            console.log("Email send response:", info);

            res.render("contact", { submitted: "yes" }); // Render contact view with success status
        }
    });
});

const port = process.env.PORT || 8080; // Set the port from environment variables or default to 8080
app.listen(port); // Start the server on the specified port
console.log("Express started. Listening on port %s", port); // Log message indicating server has started
