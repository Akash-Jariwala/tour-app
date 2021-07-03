const stripe = require('stripe')('sk_test_51IyJkoSECSG4LAV66jtMDrgTs4wojH0vQBu05nPku3RZ0TL7eR9pYy7D0R3Xn9m6jRfmskczUS5dNhGaIdWW0WxK004bDzHlH8');
const Tour = require("./../models/tourModel");
const User = require("./../models/userModel")
const Booking = require("./../models/bookingModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require('./handlerFactory');
const Email = require('./../utils/email')
// const { nets } = require('face-api.js');


exports.getCheckoutSession = catchAsync(async(req, res, next) => {
    // 1) GET currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
        }]
    });    

    // 3) create session as responce
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async(req, res, next) => {

    // This is only tyemporary, because this is unsecure and everyone can make booking without paying.
    // console.log(req.params.tour);
    const { tour, user, price } = req.query;
    
    if(!tour && !user && !price){
         return next();
    }
    await Booking.create({tour, user, price});

    const userData = await User.findById(user);
    const userEmail = userData.email;

    res.redirect(req.originalUrl.split('?')[0]);

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(url, userEmail).sendPaymentSuccess();
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
