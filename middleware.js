const Listing=require("./models/listing");
const Review=require("./models/review.js");
const{listingSchema,reviewSchema}=require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");

module.exports.isLoggedIn =(req,res,next)=>{
 
      if(!req.isAuthenticated()){
        //redirectUrl
        req.session.redirectUrl=req.originalUrl;
        
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login");
     }//by default give a passport to check user login or not
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
};

// for user that user owner can update delete or nay other change in page 
module.exports.isOwner= async(req,res,next)=>{
   let{id}=req.params;
     let listing = await Listing.findById(id);
     if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
     }

     next();
};

module.exports.validateListing = (req,res,next) =>{
    let {error}=listingSchema.validate(req.body);
    
    if(error){
        let errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports. validateReview = (req,res,next) =>{
    let {error}=reviewSchema.validate(req.body);
    
    if(error){
        let errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports.isreviewAuthor= async(req,res,next)=>{
   let{id,reviewId}=req.params;
     let review = await Review.findById(reviewId);
     if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
     }

     next();
};

module.exports.canCancelBooking = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("bookedBy");
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    if (!listing.booked) {
        req.flash("error", "This listing is not booked!");
        return res.redirect(`/listings/${id}`);
    }
    
    // Check if user is the booker or the listing owner
    const isBooker = listing.bookedBy && listing.bookedBy._id.equals(req.user._id);
    const isOwner = listing.owner.equals(req.user._id);
    
    if (!isBooker && !isOwner) {
        req.flash("error", "You can only cancel bookings you made or own!");
        return res.redirect(`/listings/${id}`);
    }
    
    next();
};