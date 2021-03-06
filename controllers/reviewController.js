const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');



// exports.getAllReviews = catchAsync(async(req, res, next) => {
//     let filter = {}
//     if(req.params.tourId) filter = { tour: req.params.tourId };

//     const reviews = await Review.find(filter);

//     res.status(200).json({
//         status: "Success",
//         results: reviews.length,
//         data: {
//             reviews
//         },
//     });
// });

exports.setTourUserIds = (req, res, next) => {
      // Allow nested routes
      if(!req.body.tour) req.body.tour = req.params.tourId;
      if(!req.body.user) req.body.user = req.user.id;

     next();
}

exports.createReviews = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);   // this is implemented in handlerFactory file
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
