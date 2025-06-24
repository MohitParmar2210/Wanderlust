const { model } = require("mongoose");
const Listing=require("../models/listing");

module.exports.index=async(req,res) =>{
    const allListings= await Listing.find({});
        res.render("listings/index.ejs",{allListings})
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id)
    .populate({path:"reviews",populate:{
        path:"author",
    },
})
    .populate("owner")
    .populate("bookedBy");
    if(!listing)
    {
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing=async(req,res,next)=>{
        let url=req.file.path;
        let filename=req.file.filename;

        const newListing=  new Listing(req.body.listing);
        newListing.owner= req.user._id;
        newListing.image={url,filename};
        await newListing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
    };
    module.exports.renderEditForm=async (req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing)
    {
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl= listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};
module.exports.updateListing=async(req,res)=>{
    let{id}=req.params;
    let listing=await  Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file!=="undefined"){
     let url=req.file.path;
     let filename=req.file.filename;

     listing.image={url,filename};
     await listing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
     let{id} = req.params;
     let deletedlisting=await Listing.findByIdAndDelete(id);
     console.log(deletedlisting);
     req.flash("success","Listing Deleted!");
     res.redirect("/listings");
};

module.exports.bookListing = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    if (listing.booked) {
        req.flash("error", "This listing is already booked!");
        return res.redirect(`/listings/${id}`);
    }
    
    // Save booking details from form
    listing.booked = true;
    listing.bookedBy = req.user._id;
    listing.startDate = req.body.startDate;
    listing.endDate = req.body.endDate;
    listing.paymentNote = req.body.paymentNote;
    await listing.save();
    
    req.flash("success", "Listing booked successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.cancelBooking = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("bookedBy");
    
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
    
    listing.booked = false;
    listing.bookedBy = null;
    await listing.save();
    
    req.flash("success", "Booking cancelled successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.ownerListings = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id }).populate('bookedBy');
    res.render('listings/owner.ejs', { listings });
};

module.exports.myBookings = async (req, res) => {
    const listings = await Listing.find({ bookedBy: req.user._id }).populate('owner');
    res.render('listings/myBookings.ejs', { listings });
};

//mvc framework