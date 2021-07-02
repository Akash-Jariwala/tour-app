const express = require('express');
const reviewController = require('./../../../controllers/reviewController');
const authController = require('./../../../controllers/authController');
const router = express.Router({ mergeParams: true });

// mergeParams: By default each router only have access to the parameter of their specific routes. In below' s example in POST req there is no tourId in URL, BUT in order to get access to the tourID that was in other router, So in order to get access to that other router, we need to physically merge the parameters, that acctualy mergeParams Does.

router.use(authController.protect);

//  POST /tour/4654/reviews
//  GEt /tour/4654/reviews
//  POST /reviews

// So whatever type of route we get, all will end up to the handler: route('/'), because all of the route stars with the '/tour/id' pattern 


router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'), 
        reviewController.setTourUserIds, 
        reviewController.createReviews);

router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'),reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'),reviewController.deleteReview);

module.exports = router;