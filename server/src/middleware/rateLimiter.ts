import rateLimit from 'express-rate-limit';
import { config } from '../config/env.ts';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      statusCode: 429,
    },
  },
});
