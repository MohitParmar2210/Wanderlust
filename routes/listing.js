const express= require("express");
const router= express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const{isLoggedIn, isOwner,validateListing, canCancelBooking}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer')//for file upload image
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });

// Place /search route before any dynamic :id routes
router.get("/search", async (req, res) => {
  const location = req.query.location;
  let listings = [];
  if (location) {
    listings = await Listing.find({ location: { $regex: new RegExp(location, 'i') } });
  }
  res.render("listings/search.ejs", { listings, location });
});

// Place /my-bookings route before any dynamic :id routes
router.get("/my-bookings", isLoggedIn, wrapAsync(listingController.myBookings));

//Index Route
router.get("/",wrapAsync(listingController.index)
);

//New Route for create new listing
router.get("/new", isLoggedIn,listingController.renderNewForm);   

    //Show Route  use for show all data of listing

router.get("/:id", wrapAsync(listingController.showListing)
);

//Create route

router.post("/",isLoggedIn,
    upload.single('listing[image]'),validateListing,
    wrapAsync (listingController.createListing)
);



//Edit Route for update 
router.get("/:id/edit",isLoggedIn,
    isOwner,
    wrapAsync (listingController.renderEditForm)
);

//Update Route
router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),
     validateListing,
    wrapAsync(listingController.updateListing)
);

//Delete Route
router.delete("/:id",isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
);

//Booking Routes
router.post("/:id/book", isLoggedIn, wrapAsync(listingController.bookListing));

router.post("/:id/cancel", isLoggedIn, canCancelBooking, wrapAsync(listingController.cancelBooking));

// Owner's Listings Route
router.get("/owner/listings", isLoggedIn, wrapAsync(listingController.ownerListings));

module.exports=router;
