require('dotenv').config(); 
const nodemailer = require("nodemailer"); 
var express = require("express"); 
var app = express(); 
var projects = require("./projects.json"); 
var path = require("path"); 
const { engine } = require("express-handlebars");
var bodyParser = require("body-parser");




app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static('public'));

app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    defaultLayout: false,
  })
);
// This connects everything.
app.set("view engine", ".hbs");



app.get("/" , function(req,res){
    res.render("home");
});

app.get("/contact" , function(req,res){
  res.render("contact", {submitted: "no"});
});

app.get("/work" , function(req,res){
  res.render("work", {projects: projects});
});

app.get("/about" , function(req,res){
  res.render("about");
});


app.get("/project/:pid([0-9]+)" , function(req,res,next){
  // console.log("project id");
  // console.log(req.params.pid);
  var pid = req.params.pid;
  var thisProj= projects[pid.toString()];
  // console.log(thisProj);
  res.render("project", {project: thisProj});
});

//step 1  -trasnsporter

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL ,
    pass: process.env.PASS 
  }
}); 

app.post("/contact", function(req, res, next) {
  console.log("contact form posted");
  console.log(req.body);
  var name = req.body.fullname;
  var email = req.body.email;
  var note = req.body.note;
  var subject = req.body.subject;

  //step 2 
  let mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL, 
    subject: req.body.subject,
    text: req.body.note,
    html: "<b>Full Name </b>" + name + "<br><b>Email </b>" + email + "<br><b>Message </b>" + note
  };
  //step 3 
  transporter.sendMail(mailOptions, function(err, data){ 
    if(err) {
      console.log("Error sending email");
    }
    else { 
      console.log("Email sent!");
      res.render("contact", {submitted: "yes"}); 
    }
  }); 
});

var port = process.env.PORT || 8080;
app.listen(port); 
console.log("Express started. Listening on port %s", port);