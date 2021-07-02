const mongoose = require("mongoose");
const slugify = require('slugify');
const validator = require("validator");
const User = require("./../models/userModel");


const tourSchema = new mongoose.Schema({
  //creating schema for DB
  name: {
    //passing an object in name//
    type: String,
    required: [true, "A tour must have name"],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour must have less or equal then 40 characters'],
    minlength: [10, 'A tour must have more or equal then 10 characters']
    // validate: [validator.isAlpha, 'Tour name must contain characters']
  },
  slug: String,
  rating: {
    type: Number,
    default: 4.5
  },
  duration:{
    type: Number,
    required: [true, "A tour must have duration"]
  },
  maxGroupSize:{
    type: Number,
    required: [true,"A tour must have a group size"]
  },
  difficulty:{
    type: String,
    required: [true, "It shoud have a difficulty"],
    enum: {
     values: ['easy', 'medium', 'difficult'],
     message: 'Difficulty is either easy, medim or difficult'

    }
  },
  ratingsAverage:{
    type: Number,
    default: 4.3,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity:{
    type: Number,
    deafault: 0,
    select: true
  },
  price:{
    //passing an object in price//
    type: Number,
    required: [true, "A tour must have price"]
  },
  priceDiscount: {
    type: Number,
    validate:{
      validator: function(val){
        //this only points to current doc on new document creation
        return val < this.price;
      },
      message: 'Dixcount price ({VALUE}) should be below regular price'
    }
    
  },
  summary: {
    type: String,
    trim: true,    //removes white space from begenning & end of the string..
    required:[true, "Summary is must"]
  },
  description:{
    type: String,
    required: [true,"A tour must have dscription"],
    trim: true
  },
  imageCover:{
    type: String,
    required:[true, "image must have cover image"]
  },
  images:[String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    deafault: false
  },
  startLocation: {
    // GeoJSON 
    type:{
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type:{
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
},
{
  toJSON: { virtuals: true},
  toObject: { virtuals: true}
});

tourSchema.index({price: 1, ratingsAverage: -1 });
tourSchema.index({slug: 1 });
tourSchema.index({startLocation: '2dsphere'});

tourSchema.virtual('durationWeeks').get(function(){
  return this.duration/7;
});





// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//DOCUMENT MIDDLWARE: run before, save() and create()
tourSchema.pre('save',  function(next){
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
});

//Below's explaination: 
// This.guide as an input which is gonna be an array of all the user IDs nd we will loop through them usimg .map method, nd then in each iteration get the userdocument for the current ID, nd we r goona store that inside of guidesPromises (sine we r finding Users async that will return promises, therefore guidesPromises will be an aray of promises. and to run all these promises at ath same time we use await Promise.all() ) 

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises); 
//   next();
// });
// ---------------------------------------------
// tourSchema.pre('save',  function(next){
//   console.log("Will save documents....");
//   next();
// });

// tourSchema.post('save',  function(doc, next){
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE  (Note: In query middleware this always points current query)
tourSchema.pre(/^find/, function(next){         // ^find means: To match All the strings atarts with "find".
  this.find({ secretTour: {$ne: true} });
  // console.log("work3")
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next){
  this.populate({
    path: 'guides',
    select: '-__v'      // inorder to discard "__v field from output which will get through getTour API"
  });
  
  next();
})

tourSchema.pre('findOne', function(next){
  this.find({ secretTour: {$ne: true} });
  next();
});


tourSchema.post(/^find/, function(docs,next){         // ^find means: All the strings atarting from "find".
  // console.log(`Query took ${Date.now() - this.start} millisecond!`); 
  // console.log(docs);

    next();
});

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next){
//   this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema); // TOUR model to create tour document

module.exports = Tour;
