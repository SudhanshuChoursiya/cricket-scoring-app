const errorHandler = (error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  return res.status(status).json({ message });
};

export { errorHandler };
