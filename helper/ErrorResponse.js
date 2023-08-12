/**
 * @description it helps for showing errors and warnings without crashing the server
 * @return {error} show error in console or send with response to client with success false
 */
class ErrorResponse extends Error {
  constructor(...args) {
    super(args[0]);
    this.statusCode = args[1];
    this.errors = args[2];
  }
}
module.exports = ErrorResponse;
