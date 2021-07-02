class AppError extends Error{
    constructor(message, statusCode){
        super(message);  // we use "super"in order to call parent constructor.

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('404') ? 'fail': 'error' // "4" for all the code starts with 4
        
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;