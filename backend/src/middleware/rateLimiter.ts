import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    error: { 
      message: 'Too many requests, try again later.' 
    } 
  },
  // Skip rate limiting for local development
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1';
  }
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    error: { 
      message: 'Too many attempts, please try again later.' 
    } 
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    error: { 
      message: 'Too many authentication attempts, please try again later.' 
    } 
  },
});

export default { apiLimiter, strictLimiter, authLimiter };