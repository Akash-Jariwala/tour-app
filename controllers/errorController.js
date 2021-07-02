const AppError = require('./../utils/appError');
const Apperror = require('./../utils/appError');

const handlecastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleduplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const message = `Duplicate field value: ${value}. Please use another value! `;
  return new Apperror(message, 400);
};

const handleJWTError = () => new AppError('Invalid Token. Please Log in again', 401);

const handleJWTExpiredError = () => new AppError('Your Token has Expired. please Login again', 401);

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};


const sendErrorDev = (err,req, res) => {
  // A) API
  if(req.originalUrl.startsWith('/api')){      // originalUrl is entire Url, without host name.
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

  // B) RENDERED WEBSITE
  console.log('Error 🔥', err);
  return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
  });
};

const sendErrorProd = (err,req, res) => {
// A) API
if (req.originalUrl.startsWith('/api')) {
  
  // A) Operational , trusted error; send msg to client
  if(err.isOperational){
  return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  // B) programming or other unknown error: don't leak error deatils
  // 1) Log Error
  console.log('ERROR 🔥', err);
  //2) Send generic message
  return res.status(500).json({
      status:'error',
      message: "Something went very wrong !! "
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send msg to client 
  if(err.isOperational){
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

module.exports = (err,req,res,next) => { //Express consider this function as error handling middlware when we pass 4 parameter
 
    err.statusCode = err.statusCode || 500;   //If erro is defined then it will use err.statuscode or will use 500 code
    err.status = err.status || 'error';    
    if(process.env.NODE_ENV === 'development'){
      sendErrorDev(err, req, res);
    }else if(process.env.NODE_ENV === 'production'){
      let error = {...err};
      error.message = err.message;
      
      if(error.name === "CastError") error = handlecastErrorDB(error);
      if(error.statusCode === 1000) error = handleduplicateFieldsDB(error);
      if(error.name === "ValidatorError") error = handleValidationErrorDB(error);
      if(error.name === 'JsonWebTokenError') error = handleJWTError();
      if(error.name === 'TokenExpiredError') errpr = handleJWTExpiredError();

      sendErrorProd(error, req, res);
    }
  };