const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };









// const asyncHandler = () => {}
//const asyncHandler = (func) => {} //taking a function as a parameter..
// const asyncHandler = (func) => {() => {}} //when we need to pass our function down to another function..
// const asyncHandler = (func) => () => {}     //just removed the curly braces from the above code... and we have a higher order function 
// const asyncHandler = (func) => async () => {} //if to make the function as async

//USING TRY AND CATCH
//a wrapper function
/* const asyncHandler = (func) => async (err, req, res, next) => {
    try{
        await func(req,res,next)  //executing the function
    } catch (err) {
        res.status(err.code||500).json({
            success: false,
            message: err.message
        })
    }
} */
