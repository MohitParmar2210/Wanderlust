if(process.env.NODE_ENV !="production"){
require('dotenv').config()
}

const express= require("express");
const app = express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate");//for styling for creating templating on better level
const ExpressError=require("./utils/ExpressError.js");
const session =require("express-session");
const MongoStore = require('connect-mongo');

const flash= require("connect-flash");
const passport =require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const { constrainedMemory } = require('process');

//const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

async function main(){
    try {
        await mongoose.connect(dbUrl, {
            ssl: true,
            tls: true,
            tlsInsecure: false,
            directConnection: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10,
            minPoolSize: 0,
            maxIdleTimeMS: 60000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            retryReads: true
        });
        console.log("Connected to MongoDB Atlas successfully!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        if (err.name === 'MongoServerSelectionError') {
            console.error("Could not connect to MongoDB Atlas. Please check:");
            console.error("1. Your IP address is whitelisted in MongoDB Atlas");
            console.error("2. Your connection string is correct");
            console.error("3. Your username and password are correct");
        }
        process.exit(1);
    }
}

main().catch(err => {
    console.error("Fatal error during MongoDB connection:", err);
    process.exit(1);
});


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));

app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


//for mongo session becuse express session doesn't have a so mauch space to add some lisitng or some functionality in future

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});
 store.on("error",(err)=>{
    console.log("Error in MONGO SESSION STORE",err);
 });

const sessionOptions ={
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

// app.get("/",(req, res)=>{
//     res.send("Hi,I am root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());// use for to request known about that it is part of which session
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());//for store the information 
passport.deserializeUser(User.deserializeUser());// for remove theinformation from session

app.use((req,res,next)=>{
     res.locals.currUser = req.user; // 🟢 Make user available in all views
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");//middleeware for flash save in local
  //  console.log(res.locals.success);

    res.locals.mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log("Current Logged-in User: ", req.user);
   
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"college-student"
//     });

//    let registeredUser= await User.register(fakeUser,"helloworld");//it is a static method it help to save fakeUser with password helloworld
//    res.send(registeredUser);
// });

app.use("/listings",listingRouter);//for use a routes
app.use("/listings/:id/reviews" ,reviewRouter);
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
    console.log("Invalid URL requested:", req.originalUrl);
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err, req, res, next)=>{
      let { statusCode = 500, message = "Something went wrong!" } = err;
    //let{statusCode,message}=err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{err});
});
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});


