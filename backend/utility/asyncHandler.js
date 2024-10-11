//async handler for handling async operation
export const asyncHandler = (requestHandler) => {
  return (req, res, next) =>
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
};


//other approch to handle async operation
/*export const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
};*/
