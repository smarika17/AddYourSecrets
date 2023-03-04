//jshint esversion:6
const express = require ("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require("mongoose");

const app=express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

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

const User= new mongoose.model("User", userSchema);


app.get("/", function(req,res){
    res.render("home");
})

app.get("/login", function(req,res){
    res.render("login");
})

app.get("/register", function(req,res){
    res.render("register");
})

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save().then(()=>{
        res.render("secrets");
    }).catch((err)=>{
        console.log(err);
    })
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username})
    .then((foundUser) => {
        if(foundUser){
            if(foundUser.password === password){
                res.render("secrets");
            }
        }
   })
   .catch((error) => {
       //When there are errors We handle them here

console.log(err);
       res.send(400, "Bad Request");
   });
      
});
app.listen(3000, function(){
    console.log("Server started on port 3000.")
})