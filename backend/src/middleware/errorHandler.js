/**
 * Global Centalized Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Determine response status code
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this unique value already exists.';
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'The requested record was not found.';
  }
  
  console.error(`[Error] ${req.method} ${req.originalUrl} - ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

/**
 * 404 Not Found Router Middleware
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - API endpoint ${req.originalUrl} does not exist`);
  res.status(404);
  next(error);
};
