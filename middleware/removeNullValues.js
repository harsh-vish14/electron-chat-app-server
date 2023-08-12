exports.removeEmptyValues = (req, res, next) => {
  for (const key in req.body) {
    if (
      req.body[key] === null ||
      req.body[key] === undefined ||
      req.body[key] === ""
    ) {
      delete req.body[key];
    }
  }
  next();
};
