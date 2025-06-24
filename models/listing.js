const mongoose=require("mongoose");
const review = require("./review");

const Review=require("./review.js");

const Schema =mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        url:String,
        filename:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews: 
    [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    booked: {
        type: Boolean,
        default: false,
    },
    bookedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    paymentNote: {
        type: String,
    },
    // category:{
    //     type:String,
    //     enum:["mountains","arctic","farms","deserts","room"]
    // }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id :{$in: listing.reviews}});
    }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;