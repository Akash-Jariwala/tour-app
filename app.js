// Responding to URL parameter....//
const path = require('path');       // built in module.
const express = require('express');
const app = express();
const morgan = require('morgan');
const router = require("./dev-data/data/routes/tourRoutes");
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require(`./dev-data/data/routes/tourRoutes`);
const userRouter = require(`./dev-data/data/routes/userRoutes`);
const reviewRouter = require('./dev-data/data/routes/reviewRoutes');
const bookingRouter = require('./dev-data/data/routes/bookingRoutes');
const viewRouter = require('./dev-data/data/routes/viewRoutes');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');


app.enable('trust proxy');

// 1st step to implement pug template
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // It will create a path joining the directory name /views. we use it coz, it does not care about slash in the path that can create bug. coz, Node automatically creates correct path.


//SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`)); "OR"
app.use(express.static(path.join(__dirname, 'public'))); // To implement(load) all the HTMl file along with CSS file plus all the formatted img file and image(which are static files that comes from public folder).


router.param("id", (req, res, next, val) => {
  //middleware function. val contains id value received while receiving URL
  // console.log(`This is id: ${val}`);
  next();
});

// 1. GLOBALMIDDLEWARES
// set security HTTP 
app.use(helmet());    // put it in beginning 

app.use(helmet.contentSecurityPolicy({directives: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "https://js.stripe.com/v3/", "https://api.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.js" ],
  frameSrc:["'self'", "https://js.stripe.com/v3/"],
  styleSrc: [ "'self'", "https://api.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.css", "https://api.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.js"],
  // fontSrc: ["'self'", "https://fonts.googleapis.com/css?family=Lato:300,300i,700"]
}}));
//, 

// To prevent from Denial of services and brute force attack ( stop from too many request)
// Limit request from same API
const limiter = rateLimit({
  max: 100,                           // number of request allowed in hour
  windowMs: 60 * 60 * 1000,           // minute * sec * milisecond
  message: 'Too many request form this IP, please try again in an hour!'
});

app.use('/api', limiter);


console.log(process.env.NODE_ENV);


if (process.env.NODE_ENV === "development") {
  app.use(morgan('dev'));
}

// BODY PARSER, READING DATA FROM THE BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' })); //Require to create a middleware// //parses data from body.
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());    // parses cookies from the request.


// Data Senitization against NoSQL query ijection
app.use(mongosanitize());    // It willreturn middleware function that will filter all the vunlarebilities of SQL injection

// Data Sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// ----- MOst Important ------//

// * Below code block is just used for testing purpose.

// app.use((req, res, next) => {            
//   console.log("Hello from middleware...");
//   next();
// });

app.use(compression());

// TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log((req.cookies));
  next();
});


// // app.get('/api/v1/tours', getAllTours);
// // app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour); // - To create(post) new info about our new tour -//
// // console.log(req.body);
// app.patch('/api/v1/tours/:id', updateTour); // To update data using id//
// app.delete('/api/v1/tours/:id', deleteTour);

// 3. ROUTES 


// (/api/v1/<about> is a URL on which we have mounted diff. router viz. tourRouter, reviewRouter etc. that will handle all the routes(ie. get, post, delete, create etc.) related to perticulers...)
app.use('/', viewRouter); // mounted on root URL
app.use('/api/v1/tours', tourRouter); // 'tourRouter is middleware
app.use('/api/v1/users', userRouter); // 'userRouter is middleware
app.use('/api/v1/reviews', reviewRouter); // 'reviewRouter is middleware(when /api/v1/reviews called then, 'reviewRouter midlewarw will caleed')
app.use('/api/v1/bookings', bookingRouter);

// ---------------------------------------------------------------------
//code block to handle undefined request made by user (Here order to place this block in code does matter(It should be at end of the code))
// app.all('*',(req,res,next) => {        // We have used "all" in order to handle GET, POST, DELETE in single logic.
  
//   next(new AppError(`Can't find ${req.originalUrl} on this server !!`)); // here next() has used in different way, we pass error to next, whatever parameter passed to next will be consider as an error, nd that applies to evry next() function in each middleware in our application, nd this error will be passed to globle error handling middleware
// });
// --------------------------------------------------------------------------

// CALLING GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);
module.exports = app;

console.log(app.get("env"));
