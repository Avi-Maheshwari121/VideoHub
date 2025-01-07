//We also need to standarise the error format.. till now we really didn't have any proper structure of error that can be defined. So now we will be defining errors in a format in this file..

//Error is the pre-defined class in nodejs... we are extending it to make our own error class named as API ERROR CLASS..

class ApiError extends Error {
    constructor(
        statusCode,
        message = " Something went terribly wrong",
        errors = [],
        stack = "",
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors


        if(stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export {ApiError};