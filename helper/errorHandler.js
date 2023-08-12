const chalk = require("chalk");
const ErrorResponse = require("./ErrorResponse");
/**
 * @description it helps for showing errors and warnings without crashing the server
 * @return {error} show error in console
 */
module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.errors = err.errors;

  // log to console for development
  console.log(chalk.bold.redBright(err));
  console.log(err);

  // Mongoose Bad Object ID (Cast Error)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    // console.log(err);
    const message = `No resource found for the requested id: ${err.value}`;
    error = new ErrorResponse(message, 404);
  } // Mongoose Bad Value (Cast Error)
  else if (err.name === "CastError") {
    const message = `We look at everywhere. But not found any matching resources`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Duplication Error (Review Duplication)
  if (
    err.name === "MongoError" &&
    err.keyPattern.bootcamp &&
    err.keyPattern.user
  ) {
    const message = `You already added a review to this bootcamp`;
    error = new ErrorResponse(message, 403);
  }
  // Duplication in Document field
  else if (err.name === "MongoError" && err.code === 11000) {
    console.log(err);
    const duplicationKey = Object.keys(err.keyPattern)[0];
    const duplicationValue = err.keyValue[duplicationKey];
    const message = `This "${duplicationValue}" ${duplicationKey} already exists. Please choose another ${duplicationKey} for this resource.`;
    error = new ErrorResponse(message, 400);
  } // Other Mongo Error Codes
  else if (err.name === "MongoError") {
    const message = `Your request has some bad parameters. ${error.message}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((it) => {
      return ` ${it.message}`;
    });
    error = new ErrorResponse(message, 400);
  }

  // Multer Error
  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    const message = `Please upload a image with smaller file size. Max Size Limit 2MB`;
    error = new ErrorResponse(message, 400);
  }

  // Type Error response
  if (err.name === "TypeError") {
    const message = `An unknown error occurred while processing your request. Please try again later.`;
    error = new ErrorResponse(message, 500);
  }

  // JWT Error
  if (err.name === "JsonWebTokenError") {
    const message = `Session Expired. Please login again.`;
    error = new ErrorResponse(message, 401);
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message.trim() || "Server Error",
    errors: error.errors,
  });
};
