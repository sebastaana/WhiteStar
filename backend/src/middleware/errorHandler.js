export class CustomError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  }
  
  export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Error interno';
  
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        timestamp: new Date()
      });
    }
  
    console.error('Unhandled Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      timestamp: new Date()
    });
  };