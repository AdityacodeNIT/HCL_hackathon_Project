export default function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const message = error.message || "Something went wrong.";

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: error.details || null,
    },
  });
}
