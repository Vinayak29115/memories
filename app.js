const express=require("express");
const bodyParser= require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const ejs = require("ejs");
const app= express();
app.set("view engine","ejs");

app.use(express.static(__dirname+"/public"));
app.use(session({
    secret:"I am legacy",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended:false}));

mongoose
    .connect("mongodb://localhost:27017/peopleDB",{useNewUrlParser: true})
    .then(() => console.log("Successfully connected"))
    .catch(err => console.log(err));

const peopleSchema = new mongoose.Schema(
    {
        name:String,
        age: Number,
        sex: String
    }   );
 
    const people = mongoose.model("user",peopleSchema);
    
    const userSchema = new mongoose.Schema({
    email:String,
    password:String
    });
    
    userSchema.plugin(passportLocalMongoose);
    
    const myUser = mongoose.model("login",userSchema);
    passport.use(myUser.createStrategy());
    passport.serializeUser(myUser.serializeUser());
    passport.deserializeUser(myUser.deserializeUser());

    const postSchema = new mongoose.Schema({
        title:String,
        description:String
    });
    const post = mongoose.model("post", postSchema);
    
app.get("/",(req,res)=>{                //home page
    if(req.isAuthenticated())
        res.render("index");
    else
        res.redirect("/login");
    });

app.get("memories", (req,res)=>{        //travel memories page
        res.render("memories");
});

app.get("/register", (req,res)=>{       //register page
    res.render("register");
});

app.get("/login",(req,res)=>{           //login page
    res.render("login");
});


app.get("/logout",(req,res)=>{              //logout
    req.logout(function(err){
        if(err)
            console.log(err);
        else    
            res.redirect("/");        
    });
    
});


app.post("/",(req,res)=>{                   
    people.create({name:req.body.myname,age:req.body.myage}, function(err,item){
        if(err)
            console.log(err);
        else
            console.log(item);
    })
});

app.post("/register",(req,res)=>{           //user registration
   myUser.register({username:req.body.username},req.body.password, (err,item)=>{
    if(err)
    {
            console.log(err); 
            res.redirect("/register");
    }
    else
    {
        passport.authenticate("local")(req,res,function(){
            console.log("Successfully registered");
            console.log(item);
        })
    }
   }) 
});


app.post("/login",(req,res)=>{
    const user = new myUser({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if(err)
        {
            console.log(err);
            res.redirect("/login");
        }   
        else
        {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            });
        }
    });
});


app.post("/compose", (req,res)=>{

    post.create({title:req.body.blogTitle, description:req.body.blogTitle},(err, item)=>{
        if(err)
            console.log(err);
        else
            res.redirect("/compose");
    })
});


app.listen("8080",(req,res)=>{
    console.log("Server listening on port 8080");
});