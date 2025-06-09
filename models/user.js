
const mongoose=require("mongoose");

const Schema =mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema=new Schema({
    email:{
        type:String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
//user name,salting,hash password automatically add by passport-local-mongoose 