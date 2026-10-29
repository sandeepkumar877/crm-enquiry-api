function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: "An account with this email already exists." });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid resource ID." });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ success: false, message: error.message });
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : "Internal server error"
  });
}

module.exports = { notFound, errorHandler };