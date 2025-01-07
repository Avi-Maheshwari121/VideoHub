const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };









// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}} //when we need to pass our function down to another function..
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {} //if to make the function as async

//USING TRY AND CATCH
//a wrapper function
/* const asyncHandler = (func) => async (err, req, res, next) => {
    try{
        await func(req,res,next)
    } catch (err) {
        res.status(err.code||500).json({
            success: false,
            message: err.message
        })
    }
} */
