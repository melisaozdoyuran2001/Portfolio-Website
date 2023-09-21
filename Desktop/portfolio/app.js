require('dotenv').config();
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const projects = require("./projects.json");
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const app = express();

// Body parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files setup
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static('public'));

// Handlebars setup with custom helper
const hbs = exphbs.create({
    extname: ".hbs",
    defaultLayout: false,
    helpers: {
        eq: (a, b) => a === b
    }
});

app.engine('.hbs', hbs.engine);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

// Nodemailer with SendGrid setup
const options = {
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}
const transporter = nodemailer.createTransport(sgTransport(options));

// Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/contact", (req, res) => {
    res.render("contact", { submitted: "no" });
});

app.get("/work", (req, res) => {
    res.render("work", { projects: projects });
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/experience", (req, res) => {
    res.render("experience");
});

app.get("/project/:pid([0-9]+)", (req, res) => {
    var pid = req.params.pid;
    var thisProj = projects[pid.toString()];
    res.render("project", { project: thisProj });
});

app.post("/contact", (req, res) => {
    const { fullname, email, subject, note } = req.body;

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: "melisaozdoyuran@hotmail.com",
        subject: `Contact Form - ${subject}`,
        text: `
From: ${fullname} (${email})
Subject: ${subject}

${note}
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
            res.render("contact", { submitted: "error" });
        } else {
            console.log("Email sent:", info.response);
            console.log("Email send response:", info);

            res.render("contact", { submitted: "yes" });
        }
    });
});

  
  

const port = process.env.PORT || 8080;
app.listen(port); 
console.log("Express started. Listening on port %s", port);
