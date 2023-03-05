//jshint esversion:6
require('dotenv').config()
const express = require ("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const passportLocal = require("passport-local"); has to be installed, but doesn't need to be required

const app=express();

// Set up express-session
app.use(
    session({
      secret: "Secret.",
      resave: false,
      saveUninitialized: false
    })
  );

// Set up passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

// Connecting mongoose to a database
mongoose.set("strictQuery", true); // Avoids warnings in terminal
mongoose.connect("mongodb://127.0.0.1:27017/UserDB").then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
  });

const userSchema =  new mongoose.Schema({
    email: String,
    password: String
});

 
userSchema.plugin(passportLocalMongoose);

const User= new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
    res.render("home");
})

app.get("/login", function(req,res){
    res.render("login");
})

app.get("/register", function(req,res){
    res.render("register");
})

app.get('/secrets',function(req,res) {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('login');
    }
});

app.get("/logout", function(req, res){
    req.logout(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
    
});

app.post("/register",function(req,res) {
    User.register({username:req.body.username},req.body.password,function(err,user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate('local')(req,res,function () {
                res.redirect('/secrets');
            })
        }
    });
});



passport.use(User.createStrategy());
 
app.post("/login",function(req,res) {
   const user = new User({
    username: req.body.username,
    password: req.body.password
   });
   req.login(user,function(err) {
    if (err) {
        console.log(err);
    } else {
        passport.authenticate('local')(req,res,function () {
            res.redirect('/secrets');
    });
    }
   });
});
app.listen(3000, function(){
    console.log("Server started on port 3000.")
})